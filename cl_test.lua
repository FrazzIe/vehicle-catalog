RegisterCommand("+catalog", function(src, args, raw)
	SetNuiFocus(true, true)
end)

RegisterCommand("-catalog", function(src, args, raw)
	SetNuiFocus(false, false)
end)