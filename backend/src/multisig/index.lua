local lib = require "multisig.lib"
local utils = require "utils.index"

Name = Name or ao.env.Process.Tags["Name"]
-- Owner = Owner or ao.env.Process.Tags["Owner"]

--TO DO: think about weighted votes based on stake or other factors
Signers = {HJuxnSbwMURxYQh6xsXE_3OYWgYGYrUF74muIJJLdNA = 1} -- ao.env.Process.Tags["Signers"] -- list of signer addresses
Proposals = Proposals or {}

-- Sync once on process load
InitialSync = InitialSync or 'INCOMPLETE'
if InitialSync == 'INCOMPLETE' then
  utils.update_multisig_cache()
  InitialSync = 'COMPLETE'
end


Handlers.add("Create-Proposal", lib.create_proposal)

Handlers.add("Vote-Proposal", lib.vote)

Handlers.add("Get-Proposal", lib.get_proposal)

Handlers.add("Add-Signer", lib.add_signer)

Handlers.add("Remove-Signer", lib.remove_signer)
