local utils = require("utils.index")

Wallets = Wallets or {}   -- { [wallet_address] = { [multisig_name] = { process_id, name, created_at } } }
Multisigs = Multisigs or {} -- { [process_id] = { [owners] = { address, address } } }

Handlers.add("Create-Multisig", function (msg)
    local from = msg.From
    local data = msg.Data
    local name = data.name
    local threshold = data.threshold
    local signers = data.signers

    if not name or #name == 0 then
        utils.send_error(msg, "Name is required")
        return nil, "Name is required"
    end 

    if not signers or #signers == 0 then
       signers = { from } -- default to the creator as the only signer
    end

    if Wallets[from] and Wallets[from][name] then
        utils.send_error(msg, "Multisig with this name already exists for this owner")
        return
    end

    -- TO DO: work on this 
    local process_id = utils.generate_process_id()

    -- TO DO: load multisig contract
    utils.load_multisig_contract(process_id, name, threshold, signers)

    -- Update Wallets and Multisigs tables
    Wallets[from] = Wallets[from] or {}
    Wallets[from][name] = {
        process_id = process_id,
        name = name,
        created_at = msg.Timestamp
    }
    Multisigs[process_id] = {
        name = name,
        owners = signers
    }

    Send({
        device = "patch@1.0",
        wallets = Wallets,
        multisigs = Multisigs
    })

    utils.send_success(msg, "Multisig created successfully")
end)