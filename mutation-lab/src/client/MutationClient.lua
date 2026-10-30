-- LocalScript: StarterPlayer/StarterPlayerScripts/MutationLab/MutationClient
-- Handles mutation animation (chamber color cycling) and rarity reveal popup.

local TS = game:GetService("TweenService")
local RS = game:GetService("ReplicatedStorage")
local ml = RS:WaitForChild("MutationLab")
local MutationStart = ml:WaitForChild("MutationStart")
local MutationResult = ml:WaitForChild("MutationResult")
local plotsFolder = workspace:WaitForChild("MutationLab"):WaitForChild("Plots")

local RARITY_COLORS = {
	Color3.fromRGB(200,200,200), Color3.fromRGB(0,150,255),
	Color3.fromRGB(180,0,255), Color3.fromRGB(255,200,0),
	Color3.fromRGB(255,50,50), Color3.fromRGB(255,255,255),
}

MutationStart.OnClientEvent:Connect(function(plotIdx, duration)
	local plot = plotsFolder:FindFirstChild("Plot_" .. plotIdx)
	if not plot then return end
	local machine = plot:FindFirstChild("MutationMachine")
	if not machine then return end
	local cg = machine:FindFirstChild("ChamberGlow")
	-- Find particles
	local pe = nil
	for _, d in ipairs(machine:GetDescendants()) do
		if d:IsA("ParticleEmitter") then pe = d; break end
	end
	if pe then pe.Enabled = true; pe.Rate = 40 end
	if not cg then return end
	-- Color cycling animation
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
	-- Stop particles
	for _, d in ipairs(machine:GetDescendants()) do
		if d:IsA("ParticleEmitter") then d.Enabled = false end
	end
	-- Flash rarity color
	if cg then
		cg.Color = cData.color; cg.Transparency = 0
		TS:Create(cg, TweenInfo.new(2), {Transparency = 0.5}):Play()
	end
	-- Rarity reveal billboard
	local anchor = machine:FindFirstChild("TopCap") or machine:FindFirstChild("Base")
	if not anchor then return end
	local old = anchor:FindFirstChild("RarityReveal")
	if old then old:Destroy() end
	local bb = Instance.new("BillboardGui")
	bb.Name = "RarityReveal"; bb.Size = UDim2.new(0,10,0,4)
	bb.StudsOffset = Vector3.new(0,3,0); bb.AlwaysOnTop = true
	bb.Parent = anchor
	local rl = Instance.new("TextLabel")
	rl.Size=UDim2.new(1,0,0.5,0); rl.BackgroundTransparency=1
	rl.TextColor3=cData.color; rl.Font=Enum.Font.GothamBold
	rl.TextScaled=true; rl.Text=string.upper(cData.rarity)
	rl.TextStrokeTransparency=0; rl.TextStrokeColor3=Color3.new(0,0,0)
	rl.Parent=bb
	local nl = Instance.new("TextLabel")
	nl.Size=UDim2.new(1,0,0.4,0); nl.Position=UDim2.new(0,0,0.55,0)
	nl.BackgroundTransparency=1; nl.TextColor3=Color3.fromRGB(230,230,230)
	nl.Font=Enum.Font.Gotham; nl.TextScaled=true; nl.Text=cData.name
	nl.TextStrokeTransparency=0; nl.TextStrokeColor3=Color3.new(0,0,0)
	nl.Parent=bb
	-- Pop-in
	TS:Create(bb,TweenInfo.new(0.4,Enum.EasingStyle.Back),
		{Size=UDim2.new(0,220,0,90)}):Play()
	-- Fade out
	task.delay(4, function()
		if not bb.Parent then return end
		TS:Create(rl,TweenInfo.new(0.5),{TextTransparency=1,TextStrokeTransparency=1}):Play()
		TS:Create(nl,TweenInfo.new(0.5),{TextTransparency=1,TextStrokeTransparency=1}):Play()
		task.wait(0.6)
		if bb.Parent then bb:Destroy() end
	end)
end)
