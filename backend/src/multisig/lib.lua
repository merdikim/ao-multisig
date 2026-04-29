local utils = require "utils.index"
local json = require "json"

local default_settings = {
    threshold = 1, -- Wallet quorum required to execute proposals
    defaultEndTime = 60 * 60 * 24 * 1000, -- Default time (in milliseconds) for a proposal to expire (24 hours)
}

local vote_types = {
    YES = "yes",
    NO = "no",
}

local proposal_types = {
    transfer = "transfer",
    add_signer = "add",
    remove_signer = "remove"
}

local lib = {}

local function valid_proposal_type(proposal_type)
    for _, value in pairs(proposal_types) do
        if proposal_type == value then
            return true
        end
    end

    return false
end

local function signer_count()
    local count = 0

    for _ in pairs(Signers) do
        count = count + 1
    end

    return count
end

local function current_threshold()
    local threshold = tonumber(Threshold or default_settings.threshold) or default_settings.threshold
    local total = signer_count()

    if threshold < 1 then
        threshold = 1
    end

    if total > 0 and threshold > total then
        threshold = total
    end

    Threshold = threshold
    return threshold
end

local function validate_add_signer(address)
    if not utils.is_arweave_address(address) then
        return false, "Valid signer address is required."
    end

    if Signers[address] then
        return false, "Signer already registered."
    end

    return true
end

local function add_signer(address)
    local is_valid, error_message = validate_add_signer(address)
    if not is_valid then
        return false, error_message
    end

    Signers[address] = 1
    return true
end

local function validate_remove_signer(address)
    if not utils.is_arweave_address(address) then
        return false, "Valid signer address is required."
    end

    if not Signers[address] then
        return false, "Signer not registered."
    end

    local remaining_signers = signer_count() - 1

    if remaining_signers < 1 then
        return false, "Cannot remove the last signer."
    end

    if current_threshold() > remaining_signers then
        return false, "Cannot remove signer because the threshold would exceed the signer count."
    end

    return true
end

local function remove_signer(address)
    local is_valid, error_message = validate_remove_signer(address)
    if not is_valid then
        return false, error_message
    end

    Signers[address] = nil
    return true
end

local function count_votes(proposal)
    local yesVotes = 0
    local noVotes = 0

    for _, v in pairs(proposal.votes) do
        if v == vote_types.YES then
            yesVotes = yesVotes + 1
        elseif v == vote_types.NO then
            noVotes = noVotes + 1
        end
    end

    return yesVotes, noVotes
end

local function execute_proposal(proposal)
    if proposal.executed then
        return true
    end

    local payload = proposal.payload or {}
    local is_executed, error_message = true, nil

    if proposal.proposal_type == proposal_types.add_signer then
        is_executed, error_message = add_signer(payload.address)
    elseif proposal.proposal_type == proposal_types.remove_signer then
        is_executed, error_message = remove_signer(payload.address)
    end

    if not is_executed then
        proposal.rejected = true
        proposal.error = error_message
        return false
    end

    proposal.executed = true
    return true
end

function lib.create_proposal(msg)
    local data = json.decode(msg.Data)

    if not data then
        utils.send_error(msg, "Missing data to create a proposal")
        return
    end

    local from = msg.From
    local description = data.description
    local proposal_type = data.proposal_type
    local payload = data.payload or {}
    local startTime = data.startTime or msg.Timestamp
    local endTime = data.endTime or (startTime + default_settings.defaultEndTime)
    local signers_total = signer_count()
    current_threshold()

    if not Signers[from] then
        utils.send_error(msg, "Not allowed to create a proposal. Signer not registered.")
        return
    end

    if not description or description == "" then
        utils.send_error(msg, "Description is required.")
        return
    end

    if not valid_proposal_type(proposal_type) then
        utils.send_error(msg, "Invalid proposal type. Use 'transfer', 'add', or 'remove'.")
        return
    end

    if proposal_type == proposal_types.add_signer or proposal_type == proposal_types.remove_signer then
        payload.address = data.address

        local is_valid, error_message
        if proposal_type == proposal_types.add_signer then
            is_valid, error_message = validate_add_signer(payload.address)
        else
            is_valid, error_message = validate_remove_signer(payload.address)
        end

        if not is_valid then
            utils.send_error(msg, error_message)
            return
        end
    elseif proposal_type == proposal_types.transfer then
        payload.recipient = data.recipient
        payload.amount = data.amount

        if not utils.is_arweave_address(payload.recipient) then
            utils.send_error(msg, "Valid transfer recipient is required.")
            return
        end

        if tonumber(payload.amount) == nil or tonumber(payload.amount) <= 0 then
            utils.send_error(msg, "Transfer amount must be greater than zero.")
            return
        end
    end

    if endTime <= startTime then
        utils.send_error(msg, "End time must be greater than start time.")
        return
    end

    if endTime <= msg.Timestamp then
        utils.send_error(msg, "End time must be in the future.")
        return
    end

    if signers_total == 0 then
        utils.send_error(msg, "No signers registered.")
        return
    end

    local new_proposal = {
        id = #Proposals + 1,
        description = description,
        proposal_type = proposal_type,
        payload = payload,
        startTime = startTime,
        endTime = endTime,
        votes = {},
        executed = false,
        rejected = false,
    }

    Proposals[new_proposal.id] = new_proposal

    if current_threshold() == 1 and signers_total == 1 then
        new_proposal.votes[from] = vote_types.YES -- Automatically vote for the proposal if there's only one signer
        execute_proposal(new_proposal)
    end

    utils.update_multisig_cache()

    utils.send_success(msg, { proposalId = new_proposal.id })
end

function lib.vote(msg)
    local data = json.decode(msg.Data)

    if not data then
        utils.send_error(msg, "Missing data to vote")
        return
    end

    local from = msg.From
    local proposalId = data.proposalId
    local vote = data.vote

    if not Signers[from] then
        utils.send_error(msg, "Not allowed to vote. Signer not registered.")
        return
    end

    local proposal = Proposals[proposalId]
    if not proposal then
        utils.send_error(msg, "Proposal not found.")
        return
    end

    if proposal.executed or proposal.rejected then
        utils.send_error(msg, "Proposal already executed or rejected.")
        return
    end

    if msg.Timestamp > proposal.endTime then
        utils.send_error(msg, "Proposal has expired.")
        return
    end

    if proposal.votes[from] then
        utils.send_error(msg, "Address has already voted on this proposal.")
        return
    end

    if vote ~= vote_types.YES and vote ~= vote_types.NO then
        utils.send_error(msg, "Invalid vote type. Use 'yes' or 'no'.")
        return
    end

    proposal.votes[from] = vote

    -- Check if the proposal can be executed based on the wallet quorum.
    local yesVotes, noVotes = count_votes(proposal)

    local threshold = current_threshold()
    local signers_total = signer_count()

    if yesVotes >= threshold then
        execute_proposal(proposal)
    end

    if noVotes > signers_total - threshold then
        proposal.rejected = true -- Mark the proposal as rejected since no amount of yes votes can reach the threshold
    end

    utils.update_multisig_cache()
    utils.send_success(msg, { message = "Vote recorded." })
end

function lib.get_proposal(msg)
    local data = msg.Data
    local proposalId = data.proposalId

    local proposal = Proposals[proposalId]
    if not proposal then
        utils.send_error(msg, "Proposal not found.")
        return
    end

    utils.send_success(msg, { proposal = proposal })
end

return lib
