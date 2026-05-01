local lib = require "multisig.lib"
local utils = require "utils.index"
local json = require "json"

local process_tags = ao and ao.env and ao.env.Process and ao.env.Process.Tags or {}

local function get_tag(name)
  return process_tags[name]
end

local function normalize_signers(raw_signers)
  local signers = {}

  local function add_signer(address)
    if utils.is_arweave_address(address) then
      signers[address] = 1
    end
  end

  if type(raw_signers) == "table" then
    for key, value in pairs(raw_signers) do
      if type(key) == "string" and value then
        add_signer(key)
      end

      add_signer(value)
    end
  elseif type(raw_signers) == "string" and raw_signers ~= "" then
    local ok, decoded = pcall(json.decode, raw_signers)
    if ok then
      return normalize_signers(decoded)
    end

    for signer in raw_signers:gmatch("[^,%s]+") do
      add_signer(signer)
    end
  end

  add_signer(Owner)

  return signers
end

local function signer_count(signers)
  local count = 0

  for _ in pairs(signers) do
    count = count + 1
  end

  return count
end

Name = Name or get_tag("Name")
-- Owner = Owner or ao.env.Process.Tags["Owner"]

--TO DO: think about weighted votes based on stake or other factors
Signers = Signers or normalize_signers(get_tag("Signers"))
Threshold = tonumber(Threshold or get_tag("Threshold")) or 1
local signers_total = signer_count(Signers)
if signers_total > 0 and Threshold > signers_total then
  Threshold = signers_total
elseif Threshold < 1 then
  Threshold = 1
end
Proposals = Proposals or {}

-- Sync once on process load
InitialSync = InitialSync or 'INCOMPLETE'
if InitialSync == 'INCOMPLETE' then
  utils.update_multisig_cache()
  InitialSync = 'COMPLETE'
end


Handlers.add("Create-Proposal", "Create-Proposal", lib.create_proposal)

Handlers.add("Vote-Proposal", "Vote-Proposal", lib.vote)

Handlers.add("Get-Proposal", "Get-Proposal", lib.get_proposal)
