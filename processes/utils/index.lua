local utils = {}

function utils.send_error(msg, error_message)
    -- TO DO : maybe use msg.reply
    Send(
      {
        Target = msg.From,
        Type = "Error",
        Error = error_message
    })
end

function utils.send_success(msg, data)
    -- TO DO : maybe use msg.reply
    Send(
      {
        Target = msg.From,
        Type = "Success",
        Data = data
    })
end

function utils.prepare_for_cache(proposals)
    local cache_ready_proposals = {}
    for _, proposal in pairs(proposals) do
      table.insert(cache_ready_proposals, proposal)
    end
    return cache_ready_proposals
end

function utils.generate_process_id()
    -- TO DO: implement a proper unique ID generator
    return "process_" .. math.random(100000, 999999)
end

function utils.load_multisig_contract(process_id, name, threshold, signers)
    -- TO DO: implement contract loading logic
    -- This is a placeholder function and should be replaced with actual implementation
    print("Loading multisig contract for process_id:", process_id)
end

function utils.is_arweave_address(address)
    if type(address) ~= "string" then
        return false
    end
    -- Arweave addresses are 43 characters long and base64url encoded
    return string.len(address) == 43 and string.match(address, "^[A-Za-z0-9_-]+$") ~= nil
end

return utils