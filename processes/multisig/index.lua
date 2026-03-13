local lib = require "multisig.lib"

Name = Name or ao.env.Process.Tags["Name"]
-- Owner = Owner or ao.env.Process.Tags["Owner"]

--TO DO: think about weighted votes based on stake or other factors
Signers = Signers or ao.env.Process.Tags["Signers"] -- list of signer addresses
Proposals = Proposals or {}


Handlers.add("Create-Proposal", lib.create_proposal)

Handlers.add("Vote-Proposal", lib.vote)

Handlers.add("Get-Proposal", lib.get_proposal)

Handlers.add("Add-Signer", lib.add_signer)

Handlers.add("Remove-Signer", lib.remove_signer)
