---@diagnostic disable: undefined-field, assign-type-mismatch
local utils = require("utils.index")
local json = require("json")

-- Wallets schema:
-- {
--   [wallet_address] = {
--     multisigs = {
--       [process_id] = {
--         process_id = process_id,
--         name = multisig_name,
--         created_at = timestamp,
--       }
--     }
--   }
-- }
Wallets = Wallets or {}

-- Multisigs schema:
-- {
--   [process_id] = {
--     process_id = process_id,
--     name = multisig_name,
--     signers = { wallet_address, ... },
--     created_at = timestamp,
--     updated_at = timestamp
--   }
-- }
Multisigs = Multisigs or {}

-- Sync once on process load
InitialSync = InitialSync or 'INCOMPLETE'
if InitialSync == 'INCOMPLETE' then
  utils.update_multisigs_cache()
  InitialSync = 'COMPLETE'
end


local function add_multisig_to_wallet(address, multisig)
    local wallet = Wallets[address] or {
        multisigs = {}
    }

    wallet.multisigs[multisig.process_id] = {
        process_id = multisig.process_id,
        name = multisig.name,
        created_at = multisig.created_at,
    }

    Wallets[address] = wallet
end

local function remove_multisig_from_wallet(address, process_id)
    local wallet = Wallets[address]
    if not wallet or not wallet.multisigs then
        return
    end

    wallet.multisigs[process_id] = nil
end

local function wallet_has_multisig_name(address, name)
    local wallet = Wallets[address]
    if not wallet or not wallet.multisigs then
        return false
    end

    for process_id, multisig in pairs(wallet.multisigs) do
        local found_multisig = Multisigs[process_id]
        if found_multisig and multisig.name == name then
            return true
        end
    end

    return false
end

local function normalize_signers(signers, creator)
    local normalized = {}
    local seen = {}

    if type(signers) ~= "table" then
        signers = {}
    end

    for _, signer in ipairs(signers) do
        if utils.is_arweave_address(signer) and not seen[signer] then
            table.insert(normalized, signer)
            seen[signer] = true
        end
    end

    if utils.is_arweave_address(creator) and not seen[creator] then
        table.insert(normalized, creator)
    end

    return normalized
end

local function emit_patch()
    Send({
        device = "patch@1.0",
---@diagnostic disable-next-line: assign-type-mismatch
        wallets = Wallets,
        multisigs = Multisigs
    })
end

local function message_data(msg)
    if type(msg.Data) ~= "string" then
        return msg.Data or {}
    end

    local ok, decoded = pcall(json.decode, msg.Data)
    if ok and type(decoded) == "table" then
        return decoded
    end

    return {}
end


Handlers.add("Create-Multisig", "Create-Multisig", function(msg)
    local from = msg.From
    local data = message_data(msg)
    local timestamp = msg.Timestamp
    local name = data.name
    local process_id = data.process_id
    local signers = normalize_signers(data.signers, from)
    local threshold = tonumber(data.threshold) or 1

    if not name or name == "" then
        utils.send_error(msg, "Name is required")
        return
    end

    if not utils.is_arweave_address(process_id) then
        utils.send_error(msg, "Process Id is required")
        return
    end

    if #signers == 0 then
        utils.send_error(msg, "At least one valid signer is required")
        return
    end

    if threshold < 1 or threshold > #signers then
        utils.send_error(msg, "Threshold must be between 1 and the signer count")
        return
    end

    if wallet_has_multisig_name(from, name) then
        utils.send_error(msg, "Multisig with this name already exists for this creator")
        return
    end

    --local process_id = utils.generate_process_id()
    utils.generate_process_id()
    local multisig = {
        process_id = process_id,
        name = name,
        threshold = threshold,
        signers = signers,
        created_at = timestamp,
        updated_at = timestamp
    }
    Send({
        Target=ao.id,
        Data = json.encode(multisig)
    })

    -- utils.load_multisig_contract(process_id, name, threshold, signers)

    Multisigs[process_id] = multisig

    for _, signer in ipairs(signers) do
        add_multisig_to_wallet(signer, multisig)
    end

    emit_patch()
    utils.send_success(msg, {message="Multisig created successfully"})
end)

Handlers.add("Update-Multisig-Signers", "Update-Multisig-Signers", function(msg)
    local process_id = msg.From
    local data = message_data(msg)
    local timestamp = msg.Timestamp
    local new_signer = data.signer

    if not process_id then
        utils.send_error(msg, "process_id is required")
        return
    end

    if not new_signer then
        utils.send_error(msg, "New signer is required")
        return
    end

    if not utils.is_arweave_address(new_signer) then
        utils.send_error(msg, "Invalid Arweave address")
        return
    end

    local multisig = Multisigs[process_id]
    if not multisig then
        utils.send_error(msg, "Multisig not found")
        return
    end

    for _, signer in ipairs(multisig.signers) do
        if signer == new_signer then
            utils.send_error(msg, "Signer is already in the multisig signers list")
            return
        end
    end

    table.insert(multisig.signers, new_signer)
    multisig.updated_at = timestamp

    add_multisig_to_wallet(new_signer, multisig)
    emit_patch()

    utils.send_success(msg, {message="Multisig signers updated successfully"})
end)

Handlers.add("Remove-Multisig-Signers", "Remove-Multisig-Signers", function(msg)
    local process_id = msg.From
    local data = message_data(msg)
    local timestamp = msg.Timestamp
    local signer_to_remove = data.signer

    if not process_id then
        utils.send_error(msg, "process_id is required")
        return
    end

    if not signer_to_remove then
        utils.send_error(msg, "Signer to remove is required")
        return
    end

    if not utils.is_arweave_address(signer_to_remove) then
        utils.send_error(msg, "Invalid Arweave address")
        return
    end

    local multisig = Multisigs[process_id]
    if not multisig then
        utils.send_error(msg, "Multisig not found")
        return
    end

    if #multisig.signers == 1 then
        utils.send_error(msg, "Cannot remove the last signer from a multisig")
        return
    end

    if multisig.threshold and multisig.threshold > #multisig.signers - 1 then
        utils.send_error(msg, "Cannot remove signer because the threshold would exceed the signer count")
        return
    end

    local signer_found = false    
    for _, signer in ipairs(multisig.signers) do
        if signer == signer_to_remove then
            signer_found = true
            break
        end
    end

    if not signer_found then
        utils.send_error(msg, "Signer not found in multisig signers list")
        return
    end

    for i, signer in ipairs(multisig.signers) do
        if signer == signer_to_remove then
            table.remove(multisig.signers, i)
            break
        end
    end

    multisig.updated_at = timestamp

    remove_multisig_from_wallet(signer_to_remove, process_id)
    emit_patch()

    utils.send_success(msg, {message="Multisig signers updated successfully"})
end)
