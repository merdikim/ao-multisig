local utils = require "utils.index"

local default_settings = {
    treshold = 1, -- Number of signatures required to execute a proposal
    defaultEndTime = 60 * 60 * 24, -- Default time (in seconds) for a proposal to expire (24 hours)
}

local vote_types = {
    YES = "yes",
    NO = "no",
}

local lib = {}

local function signer_count()
    local count = 0

    for _ in pairs(Signers) do
        count = count + 1
    end

    return count
end

function lib.create_proposal(msg)
    local data = msg.Data
    local from = msg.From
    local description = data.description
    local endTime = data.endTime or msg.Timestamp + default_settings.defaultEndTime 
    local startTime = data.startTime or msg.Timestamp 
    local signers_total = signer_count()
    --local payload = data.payload -- You can include any additional data you want to associate with the proposal

    if not Signers[from] then
        utils.send_error(msg, "Not allowed to create proposal. Signer not registered.")
        return
    end

    if not description or description == "" then
        utils.send_error(msg, "Description is required.")
        return
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
        startTime = startTime,
        endTime = endTime,
        votes = {},
        executed = false,
        rejected = false,
        treshold = signers_total, -- TO DO: make this dynamic based on the number of signers or a predefined threshold
    }

    Proposals[new_proposal.id] = new_proposal

    if signers_total == 1 then
        new_proposal.votes[from] = vote_types.YES -- Automatically vote for the proposal if there's only one signer
        --TODO: execute the proposal immediately since it meets the threshold
    end

    utils.update_multisig_cache()

    utils.send_success(msg, { proposalId = new_proposal.id })
end

function lib.vote(msg)
    local data = msg.Data
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

    if vote ~= vote_types.YES and vote ~= vote_types.NO then
        utils.send_error(msg, "Invalid vote type. Use 'yes' or 'no'.")
        return
    end

    proposal.votes[from] = vote

    -- Check if the proposal can be executed based on the votes and threshold
    local yesVotes = 0
    local noVotes = 0
    for _, v in pairs(proposal.votes) do
        if v == vote_types.YES then
            yesVotes = yesVotes + 1
        elseif v == vote_types.NO then
            noVotes = noVotes + 1
        end
    end

    if yesVotes >= proposal.treshold then
        --TO DO: execute the proposal since it meets the threshold
    end

    if noVotes > signer_count() - proposal.treshold then
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

function lib.add_signer(msg)
    local new_signer = msg.Data.address

    if not Signers[msg.From] then
        utils.send_error(msg, "Not allowed to add signer. Signer not registered.")
        return
    end

    if Signers[new_signer] then
        utils.send_error(msg, "Signer already registered.")
        return
    end

    Signers[new_signer] = 1

    utils.update_multisig_cache()
    utils.send_success(msg, { message = "Signer registered successfully." })
end

function lib.remove_signer(msg)
    local from = msg.From
    local signer_to_remove = msg.Data.address

    if not Signers[from] then
        utils.send_error(msg, "Not allowed to remove signer. Signer not registered.")
        return
    end

    if not Signers[signer_to_remove] then
        utils.send_error(msg, "Signer not registered.")
        return
    end

    if signer_count() <= 1 then
        utils.send_error(msg, "Cannot remove the last signer.")
        return
    end

    Signers[signer_to_remove] = nil

    utils.update_multisig_cache()
    utils.send_success(msg, { message = "Signer unregistered successfully." })
end

return lib
