-- Script: ServerScriptService/MutationLab/PlotManager
-- Assigns one laboratory plot per player, teleports on spawn, releases on leave.

local Players = game:GetService("Players")
local RS = game:GetService("ReplicatedStorage")

local mlFolder = RS:WaitForChild("MutationLab")
local Config = require(mlFolder:WaitForChild("Config"))
local PlotAssigned = mlFolder:WaitForChild("PlotAssigned")
local plotsFolder = workspace:WaitForChild("MutationLab"):WaitForChild("Plots")

local NUM_PLOTS = Config.NUM_PLOTS
local plots = {}        -- index -> { model, owner }
local playerPlots = {}  -- Player -> plotIndex

----------------------------------------------------------------
-- Initialise plot table from workspace models
----------------------------------------------------------------
for i = 1, NUM_PLOTS do
	plots[i] = {
		model = plotsFolder:WaitForChild("Plot_" .. i),
		owner = nil,
	}
end
print("[PlotManager] Initialised " .. NUM_PLOTS .. " plots")

----------------------------------------------------------------
-- Helpers
----------------------------------------------------------------
local function getSignText(plotIndex: number, partName: string): TextLabel?
	local signPart = plots[plotIndex].model:FindFirstChild(partName)
	if not signPart then return nil end
	local gui = signPart:FindFirstChildWhichIsA("SurfaceGui")
	if not gui then return nil end
	return gui:FindFirstChild("SignText")
end

local function updateSign(plotIndex: number, playerName: string?)
	local status = getSignText(plotIndex, "StatusSign")
	if not status then return end
	if playerName then
		status.Text = playerName
		status.TextColor3 = Color3.fromRGB(0, 255, 120)
	else
		status.Text = "AVAILABLE"
		status.TextColor3 = Color3.fromRGB(80, 200, 130)
	end
end

----------------------------------------------------------------
-- Plot assignment (no yields, safe from interleaving)
----------------------------------------------------------------
local function assignPlot(player: Player): number?
	if playerPlots[player] then
		return playerPlots[player]
	end

	for i = 1, NUM_PLOTS do
		if plots[i].owner == nil then
			plots[i].owner = player
			playerPlots[player] = i
			updateSign(i, player.Name)
			PlotAssigned:FireClient(player, i)
			print("[PlotManager] " .. player.Name .. " -> Plot " .. i)
			return i
		end
	end

	warn("[PlotManager] No plots available for " .. player.Name)
	return nil
end

local function releasePlot(player: Player)
	local idx = playerPlots[player]
	if not idx then return end
	plots[idx].owner = nil
	playerPlots[player] = nil
	updateSign(idx, nil)
	print("[PlotManager] Plot " .. idx .. " released")
end

local function teleportToPlot(character: Model, plotIndex: number)
	local spawn = plots[plotIndex].model:FindFirstChild("PlotSpawn")
	if spawn then
		character:PivotTo(spawn.CFrame + Vector3.new(0, 3, 0))
	end
end

----------------------------------------------------------------
-- Player lifecycle
----------------------------------------------------------------
Players.PlayerAdded:Connect(function(player)
	player.CharacterAdded:Connect(function(character)
		task.wait(0.2)
		local idx = playerPlots[player] or assignPlot(player)
		if idx and character.Parent then
			teleportToPlot(character, idx)
		end
	end)
end)

Players.PlayerRemoving:Connect(function(player)
	releasePlot(player)
end)

game:BindToClose(function()
	for player in playerPlots do
		releasePlot(player)
	end
end)
