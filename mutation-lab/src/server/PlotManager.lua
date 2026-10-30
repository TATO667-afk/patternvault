-- Script: ServerScriptService/MutationLab/PlotManager
-- Assigns one laboratory plot per player, teleports on spawn, releases on leave.
-- Phase 2: adds OwnerId attribute for ownership verification, cleans creatures on release.

local Players = game:GetService("Players")
local RS = game:GetService("ReplicatedStorage")
local mlFolder = RS:WaitForChild("MutationLab")
local Config = require(mlFolder:WaitForChild("Config"))
local PlotAssigned = mlFolder:WaitForChild("PlotAssigned")
local plotsFolder = workspace:WaitForChild("MutationLab"):WaitForChild("Plots")
local NUM_PLOTS = Config.NUM_PLOTS
local plots = {}
local playerPlots = {}
for i = 1, NUM_PLOTS do
	local model = plotsFolder:WaitForChild("Plot_" .. i)
	plots[i] = {model = model, owner = nil}
	model:SetAttribute("OwnerId", 0)
end
print("[PlotManager] Initialised " .. NUM_PLOTS .. " plots")
local function getSignText(idx, partName)
	local sp = plots[idx].model:FindFirstChild(partName)
	if not sp then return nil end
	local gui = sp:FindFirstChildWhichIsA("SurfaceGui")
	if not gui then return nil end
	return gui:FindFirstChild("SignText")
end
local function updateSign(idx, name)
	local st = getSignText(idx, "StatusSign")
	if not st then return end
	if name then
		st.Text = name
		st.TextColor3 = Color3.fromRGB(0,255,120)
	else
		st.Text = "AVAILABLE"
		st.TextColor3 = Color3.fromRGB(100,220,160)
	end
end
local function assignPlot(player)
	if playerPlots[player] then return playerPlots[player] end
	for i = 1, NUM_PLOTS do
		if plots[i].owner == nil then
			plots[i].owner = player
			playerPlots[player] = i
			plots[i].model:SetAttribute("OwnerId", player.UserId)
			updateSign(i, player.Name)
			PlotAssigned:FireClient(player, i)
			print("[PlotManager] " .. player.Name .. " -> Plot " .. i)
			return i
		end
	end
	warn("[PlotManager] No plots for " .. player.Name)
	return nil
end
local function releasePlot(player)
	local idx = playerPlots[player]
	if not idx then return end
	plots[idx].owner = nil
	plots[idx].model:SetAttribute("OwnerId", 0)
	playerPlots[player] = nil
	updateSign(idx, nil)
	for si = 1, 6 do
		local slot = plots[idx].model:FindFirstChild("Slot_" .. si)
		if slot then
			for _, child in ipairs(slot:GetChildren()) do
				if child:IsA("Model") then child:Destroy() end
			end
		end
	end
	print("[PlotManager] Plot " .. idx .. " released")
end
local function teleportToPlot(character, idx)
	local sp = plots[idx].model:FindFirstChild("PlotSpawn")
	if sp then character:PivotTo(sp.CFrame + Vector3.new(0,3,0)) end
end
Players.PlayerAdded:Connect(function(player)
	player.CharacterAdded:Connect(function(character)
		task.wait(0.5)
		local idx = playerPlots[player] or assignPlot(player)
		if idx and character.Parent then teleportToPlot(character, idx) end
	end)
end)
Players.PlayerRemoving:Connect(function(player)
	releasePlot(player)
end)
game:BindToClose(function()
	for _, pd in pairs(plots) do
		if pd.owner then releasePlot(pd.owner) end
	end
end)
