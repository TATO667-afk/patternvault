-- LocalScript: StarterPlayer/StarterPlayerScripts/MutationLab/MutationClient
-- Handles mutation animation (chamber color cycling) and rarity reveal popup.

local TS = game:GetService("TweenService")
local RS = game:GetService("ReplicatedStorage")
local ml = RS:WaitForChild("MutationLab")
local Config = require(ml:WaitForChild("Config"))
local MutationStart = ml:WaitForChild("MutationStart")
local MutationResult = ml:WaitForChild("MutationResult")
local plotsFolder = workspace:WaitForChild("MutationLab"):WaitForChild("Plots")

local RARITY_COLORS = {}
for i, r in ipairs(Config.RARITY) do
	RARITY_COLORS[i] = r.color
end

MutationStart.OnClientEvent:Connect(function(plotIdx, duration)
	local plot = plotsFolder:FindFirstChild("Plot_" .. plotIdx)
	if not plot then return end
	local machine = plot:FindFirstChild("MutationMachine")
	if not machine then return end
	local cg = machine:FindFirstChild("ChamberGlow")
	local pe = nil
	for _, d in ipairs(machine:GetDescendants()) do
		if d:IsA("ParticleEmitter") then pe = d; break end
	end
	if pe then pe.Enabled = true; pe.Rate = 40 end
	if not cg then return end
	task.spawn(function()
		local speed = 0.35
		local elapsed = 0
		local ci = 1
		while elapsed < duration - 0.3 do
			TS:Create(cg, TweenInfo.new(speed*0.7), {
				Color = RARITY_COLORS[ci],
				Transparency = 0.15 + math.sin(elapsed*4)*0.1
			}):Play()
			task.wait(speed)
			elapsed = elapsed + speed
			ci = (ci % #RARITY_COLORS) + 1
			speed = math.max(0.06, speed * 0.87)
		end
	end)
end)

MutationResult.OnClientEvent:Connect(function(cData, plotIdx)
	local plot = plotsFolder:FindFirstChild("Plot_" .. plotIdx)
	if not plot then return end
	local machine = plot:FindFirstChild("MutationMachine")
	if not machine then return end
	local cg = machine:FindFirstChild("ChamberGlow")
	for _, d in ipairs(machine:GetDescendants()) do
		if d:IsA("ParticleEmitter") then d.Enabled = false end
	end
	local color = RARITY_COLORS[cData.rarityIndex] or Color3.new(1,1,1)
	if cg then
		cg.Color = color; cg.Transparency = 0
		TS:Create(cg, TweenInfo.new(2), {Transparency = 0.5}):Play()
	end
	-- Rarity reveal billboard
	local anchor = machine:FindFirstChild("TopCap") or machine:FindFirstChild("Base")
	if not anchor then return end
	local old = anchor:FindFirstChild("RarityReveal")
	if old then old:Destroy() end
	local bb = Instance.new("BillboardGui")
	bb.Name="RarityReveal"; bb.Size=UDim2.new(0,10,0,4)
	bb.StudsOffset=Vector3.new(0,3,0); bb.AlwaysOnTop=true
	bb.Parent=anchor

	local rl = Instance.new("TextLabel")
	rl.Size=UDim2.new(1,0,0.4,0); rl.BackgroundTransparency=1
	rl.TextColor3=color; rl.Font=Enum.Font.GothamBold
	rl.TextScaled=true; rl.Text=string.upper(cData.rarity)
	rl.TextStrokeTransparency=0; rl.TextStrokeColor3=Color3.new(0,0,0)
	rl.Parent=bb

	local nl = Instance.new("TextLabel")
	nl.Size=UDim2.new(1,0,0.3,0); nl.Position=UDim2.new(0,0,0.42,0)
	nl.BackgroundTransparency=1; nl.TextColor3=Color3.fromRGB(230,230,230)
	nl.Font=Enum.Font.Gotham; nl.TextScaled=true; nl.Text=cData.name
	nl.TextStrokeTransparency=0; nl.TextStrokeColor3=Color3.new(0,0,0)
	nl.Parent=bb

	if cData.slotted == false then
		local wl = Instance.new("TextLabel")
		wl.Size=UDim2.new(1,0,0.22,0); wl.Position=UDim2.new(0,0,0.75,0)
		wl.BackgroundTransparency=1
		wl.TextColor3=Color3.fromRGB(255,200,50)
		wl.Font=Enum.Font.Gotham; wl.TextScaled=true
		wl.Text="Open Inventory to place!"
		wl.TextStrokeTransparency=0; wl.TextStrokeColor3=Color3.new(0,0,0)
		wl.Parent=bb
	end

	TS:Create(bb,TweenInfo.new(0.4,Enum.EasingStyle.Back),
		{Size=UDim2.new(0,220,0,100)}):Play()
	task.delay(4, function()
		if not bb.Parent then return end
		for _, label in ipairs(bb:GetDescendants()) do
			if label:IsA("TextLabel") then
				TS:Create(label,TweenInfo.new(0.5),
					{TextTransparency=1,TextStrokeTransparency=1}):Play()
			end
		end
		task.wait(0.6)
		if bb.Parent then bb:Destroy() end
	end)
end)
