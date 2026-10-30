-- ================================================================
-- MUTATION LAB  —  VISUAL POLISH INSTALLER
-- ================================================================
-- Makes everything BRIGHTER, more vibrant, and more ALIVE.
-- Adds ambient particles, pulsing neon, animated lights,
-- fog effects, and richer colors throughout the map.
-- Run after all other phases. Safe to re-run.
-- Paste into Command Bar and press Enter.
-- ================================================================

print("[MutationLab] Visual Polish installer starting...")

local WS = game:GetService("Workspace")
local Lighting = game:GetService("Lighting")
local RS = game:GetService("ReplicatedStorage")
local SP = game:GetService("StarterPlayer")
local SPS = SP:FindFirstChild("StarterPlayerScripts")

local mlRoot = WS:FindFirstChild("MutationLab")
if not mlRoot then
	error("[MutationLab] Game not found! Run Phase 1 first.")
end
local plotsFolder = mlRoot:FindFirstChild("Plots")
local lobbyFolder = mlRoot:FindFirstChild("Lobby")
local corridorsFolder = mlRoot:FindFirstChild("Corridors")
local spsFolder = SPS and SPS:FindFirstChild("MutationLab")

-- ================================================================
--  CLEANUP (for re-runs)
-- ================================================================
print("[MutationLab] Cleaning previous polish...")
for _, d in ipairs(mlRoot:GetDescendants()) do
	if d:GetAttribute("VisualPolish") then d:Destroy() end
end
if spsFolder then
	local old = spsFolder:FindFirstChild("AmbientFX")
	if old then old:Destroy() end
end
for _, c in ipairs(Lighting:GetChildren()) do
	if c:GetAttribute("VisualPolish") then c:Destroy() end
end

-- ================================================================
--  1. LIGHTING OVERHAUL — much brighter, still sci-fi
-- ================================================================
print("[MutationLab] Upgrading lighting...")
Lighting.ClockTime = 6
Lighting.Brightness = 0.6
Lighting.Ambient = Color3.fromRGB(55, 60, 90)
Lighting.OutdoorAmbient = Color3.fromRGB(40, 45, 70)
Lighting.GlobalShadows = true
Lighting.EnvironmentDiffuseScale = 0.7
Lighting.EnvironmentSpecularScale = 0.7

-- Update existing effects
for _, c in ipairs(Lighting:GetChildren()) do
	if c:GetAttribute("MutationLab") then
		if c:IsA("Atmosphere") then
			c.Density = 0.12
			c.Offset = 0.4
			c.Color = Color3.fromRGB(30, 40, 70)
			c.Decay = Color3.fromRGB(25, 35, 65)
			c.Haze = 1.5
		elseif c:IsA("BloomEffect") then
			c.Intensity = 0.75
			c.Size = 36
			c.Threshold = 0.4
		elseif c:IsA("ColorCorrectionEffect") then
			c.Brightness = 0.06
			c.Contrast = 0.12
			c.Saturation = 0.3
			c.TintColor = Color3.fromRGB(215, 240, 255)
		elseif c:IsA("Sky") then
			c.StarCount = 3000
		end
	end
end

-- Add depth of field for cinematic feel
local dof = Instance.new("DepthOfFieldEffect")
dof.Name = "LabDOF"
dof:SetAttribute("VisualPolish", true)
dof.FarIntensity = 0.08
dof.FocusDistance = 50
dof.InFocusRadius = 60
dof.NearIntensity = 0
dof.Parent = Lighting

-- Add sun rays for dramatic glow
local sr = Instance.new("SunRaysEffect")
sr.Name = "LabSunRays"
sr:SetAttribute("VisualPolish", true)
sr.Intensity = 0.03
sr.Spread = 0.5
sr.Parent = Lighting

-- ================================================================
--  2. BRIGHTER COLOR PALETTE
-- ================================================================
print("[MutationLab] Brightening surfaces...")

local BRIGHT = {
	lobbyFloor = Color3.fromRGB(85, 90, 115),
	plotFloor  = Color3.fromRGB(75, 80, 105),
	corridor   = Color3.fromRGB(80, 85, 110),
	wall       = Color3.fromRGB(100, 105, 128),
	wallDark   = Color3.fromRGB(70, 74, 95),
	pillar     = Color3.fromRGB(105, 110, 132),
	signBg     = Color3.fromRGB(22, 22, 40),
	neonGreen  = Color3.fromRGB(0, 255, 140),
	neonCyan   = Color3.fromRGB(0, 220, 255),
	neonPurple = Color3.fromRGB(180, 60, 255),
	neonPink   = Color3.fromRGB(255, 50, 180),
	neonOrange = Color3.fromRGB(255, 140, 30),
}

-- Brighten lobby
if lobbyFolder then
	for _, p in ipairs(lobbyFolder:GetChildren()) do
		if p:IsA("BasePart") then
			if p.Name == "Floor" then
				p.Color = BRIGHT.lobbyFloor
			elseif p.Name == "CentreRing" then
				p.Color = BRIGHT.wallDark
			elseif p.Name == "CentreColumn" then
				p.Color = BRIGHT.neonGreen
				p.Transparency = 0.1
				-- Make it MUCH brighter
				for _, light in ipairs(p:GetChildren()) do
					if light:IsA("PointLight") then
						light.Brightness = 5
						light.Range = 120
						light.Color = BRIGHT.neonGreen
					end
				end
			elseif p.Name == "InnerGlow" then
				p.Color = BRIGHT.neonCyan
				p.Transparency = 0.15
			elseif p.Name:match("^Pillar_") then
				p.Color = BRIGHT.pillar
			elseif p.Name:match("^PillarNeon_") then
				p.Color = BRIGHT.neonPurple
				for _, light in ipairs(p:GetChildren()) do
					if light:IsA("PointLight") then
						light.Brightness = 1.5
						light.Range = 35
						light.Color = BRIGHT.neonPurple
					end
				end
			elseif p.Name:match("^Edge") then
				p.Color = BRIGHT.neonCyan
				p.Transparency = 0.1
			elseif p:IsA("SpawnLocation") then
				p.Color = BRIGHT.neonGreen
				p.Transparency = 0.3
			end
		end
	end
end

-- Brighten plots
if plotsFolder then
	for i = 1, 8 do
		local plot = plotsFolder:FindFirstChild("Plot_" .. i)
		if plot then
			for _, p in ipairs(plot:GetChildren()) do
				if p:IsA("BasePart") then
					if p.Name == "Floor" then
						p.Color = BRIGHT.plotFloor
					elseif p.Name:match("Wall") then
						p.Color = BRIGHT.wall
					elseif p.Name:match("Neon") and p.Material == Enum.Material.Neon then
						if p.Name:match("Door") then
							p.Color = BRIGHT.neonPurple
						else
							p.Color = BRIGHT.neonGreen
							-- Brighten neon strip lights
							for _, light in ipairs(p:GetChildren()) do
								if light:IsA("PointLight") then
									light.Brightness = 2
									light.Range = 55
								end
							end
						end
					elseif p.Name == "LabLight" then
						p.Color = BRIGHT.neonCyan
						p.Transparency = 0.4
						for _, light in ipairs(p:GetChildren()) do
							if light:IsA("PointLight") then
								light.Brightness = 2.5
								light.Range = 80
								light.Color = Color3.fromRGB(180, 240, 255)
							end
						end
					elseif p.Name:match("^Slot_") and not p:FindFirstChildOfClass("Model") then
						p.Color = BRIGHT.neonGreen
						p.Transparency = 0.35
					end
				end
			end

			-- Brighten mutation machine
			local machine = plot:FindFirstChild("MutationMachine")
			if machine then
				for _, mp in ipairs(machine:GetChildren()) do
					if mp:IsA("BasePart") then
						if mp.Name == "ChamberGlow" then
							mp.Transparency = 0.35
							for _, light in ipairs(mp:GetChildren()) do
								if light:IsA("PointLight") then
									light.Brightness = 3
									light.Range = 40
								end
							end
						elseif mp.Name == "Chamber" then
							mp.Color = Color3.fromRGB(140, 240, 200)
							mp.Transparency = 0.6
						elseif mp.Name:match("Ring") then
							mp.Color = BRIGHT.neonGreen
						elseif mp.Name:match("Rod_") then
							mp.Color = BRIGHT.neonGreen
							mp.Transparency = 0.15
						end
					end
				end
			end

			-- Brighten upgrade terminal
			local terminal = plot:FindFirstChild("UpgradeTerminal")
			if terminal then
				for _, tp in ipairs(terminal:GetChildren()) do
					if tp:IsA("BasePart") then
						if tp.Name == "AccentStrip" or tp.Name == "TopBar" then
							tp.Color = BRIGHT.neonPurple
						end
						for _, light in ipairs(tp:GetChildren()) do
							if light:IsA("PointLight") then
								light.Brightness = 1.5
								light.Range = 18
							end
						end
					end
				end
			end
		end
	end
end

-- Brighten corridors
if corridorsFolder then
	for _, p in ipairs(corridorsFolder:GetChildren()) do
		if p:IsA("BasePart") then
			if p.Name:match("^Floor_") then
				p.Color = BRIGHT.corridor
			elseif p.Name:match("^Rail") then
				p.Color = BRIGHT.wallDark
			elseif p.Name:match("^Neon") and p.Material == Enum.Material.Neon then
				-- Make corridor neons more colorful — alternate between green/cyan/purple
				local idx = tonumber(p.Name:match("%d+")) or 1
				local colors = {BRIGHT.neonGreen, BRIGHT.neonCyan, BRIGHT.neonPurple, BRIGHT.neonPink}
				p.Color = colors[((idx - 1) % #colors) + 1]
			elseif p.Name:match("^Strip_") then
				local idx = tonumber(p.Name:match("%d+")) or 1
				local colors = {BRIGHT.neonGreen, BRIGHT.neonCyan, BRIGHT.neonPurple, BRIGHT.neonPink}
				p.Color = colors[((idx - 1) % #colors) + 1]
				p.Transparency = 0.05
			end
		end
	end
end

-- ================================================================
--  3. ADD AMBIENT PARTICLES — floating motes everywhere
-- ================================================================
print("[MutationLab] Adding ambient particles...")

local function addAmbientParticles(parent, name, color, rate, speed, size, lt)
	local pe = Instance.new("ParticleEmitter")
	pe.Name = name
	pe:SetAttribute("VisualPolish", true)
	pe.Color = ColorSequence.new({
		ColorSequenceKeypoint.new(0, color),
		ColorSequenceKeypoint.new(1, Color3.new(1, 1, 1)),
	})
	pe.Size = NumberSequence.new({
		NumberSequenceKeypoint.new(0, 0),
		NumberSequenceKeypoint.new(0.3, size),
		NumberSequenceKeypoint.new(1, 0),
	})
	pe.Transparency = NumberSequence.new({
		NumberSequenceKeypoint.new(0, 1),
		NumberSequenceKeypoint.new(0.2, 0.3),
		NumberSequenceKeypoint.new(0.8, 0.3),
		NumberSequenceKeypoint.new(1, 1),
	})
	pe.Lifetime = NumberRange.new(lt * 0.7, lt)
	pe.Rate = rate
	pe.Speed = NumberRange.new(speed * 0.3, speed)
	pe.SpreadAngle = Vector2.new(180, 180)
	pe.LightEmission = 1
	pe.LightInfluence = 0
	pe.Enabled = true
	pe.Parent = parent
	return pe
end

-- Lobby: floating green/cyan motes from center column
if lobbyFolder then
	local col = lobbyFolder:FindFirstChild("CentreColumn")
	if col then
		addAmbientParticles(col, "AmbientGreen", BRIGHT.neonGreen, 15, 3, 0.5, 5)
		addAmbientParticles(col, "AmbientCyan", BRIGHT.neonCyan, 8, 2.5, 0.35, 6)
	end
	-- Floor mist
	local floor = lobbyFolder:FindFirstChild("Floor")
	if floor then
		local mist = Instance.new("ParticleEmitter")
		mist.Name = "FloorMist"
		mist:SetAttribute("VisualPolish", true)
		mist.Color = ColorSequence.new(Color3.fromRGB(80, 180, 160))
		mist.Size = NumberSequence.new({
			NumberSequenceKeypoint.new(0, 0),
			NumberSequenceKeypoint.new(0.5, 6),
			NumberSequenceKeypoint.new(1, 0),
		})
		mist.Transparency = NumberSequence.new({
			NumberSequenceKeypoint.new(0, 1),
			NumberSequenceKeypoint.new(0.3, 0.85),
			NumberSequenceKeypoint.new(0.7, 0.85),
			NumberSequenceKeypoint.new(1, 1),
		})
		mist.Lifetime = NumberRange.new(4, 7)
		mist.Rate = 5
		mist.Speed = NumberRange.new(0.2, 1)
		mist.SpreadAngle = Vector2.new(180, 0)
		mist.LightEmission = 0.5
		mist.LightInfluence = 0
		mist.Enabled = true
		mist.Parent = floor
	end
end

-- Labs: ambient particles in each lab
if plotsFolder then
	for i = 1, 8 do
		local plot = plotsFolder:FindFirstChild("Plot_" .. i)
		if plot then
			local labLight = plot:FindFirstChild("LabLight")
			if labLight then
				addAmbientParticles(labLight, "LabDust", Color3.fromRGB(100, 220, 180), 6, 1.5, 0.3, 5)
			end

			-- Machine idle glow particles
			local machine = plot:FindFirstChild("MutationMachine")
			if machine then
				local cg = machine:FindFirstChild("ChamberGlow")
				if cg then
					local idle = Instance.new("ParticleEmitter")
					idle.Name = "IdleGlow"
					idle:SetAttribute("VisualPolish", true)
					idle.Color = ColorSequence.new({
						ColorSequenceKeypoint.new(0, BRIGHT.neonGreen),
						ColorSequenceKeypoint.new(0.5, BRIGHT.neonCyan),
						ColorSequenceKeypoint.new(1, BRIGHT.neonPurple),
					})
					idle.Size = NumberSequence.new({
						NumberSequenceKeypoint.new(0, 0),
						NumberSequenceKeypoint.new(0.5, 0.25),
						NumberSequenceKeypoint.new(1, 0),
					})
					idle.Transparency = NumberSequence.new({
						NumberSequenceKeypoint.new(0, 1),
						NumberSequenceKeypoint.new(0.3, 0.4),
						NumberSequenceKeypoint.new(1, 1),
					})
					idle.Lifetime = NumberRange.new(2, 4)
					idle.Rate = 4
					idle.Speed = NumberRange.new(0.5, 2)
					idle.SpreadAngle = Vector2.new(180, 180)
					idle.LightEmission = 1
					idle.Enabled = true
					idle.Parent = cg
				end
			end

			-- Floor glow accents near entrance
			local plotSpawn = plot:FindFirstChild("PlotSpawn")
			if plotSpawn then
				local glow = Instance.new("Part")
				glow.Name = "EntranceGlow"
				glow:SetAttribute("VisualPolish", true)
				glow.Anchored = true
				glow.Size = Vector3.new(12, 0.3, 3)
				glow.CFrame = plotSpawn.CFrame * CFrame.new(0, -0.1, -10)
				glow.Color = BRIGHT.neonCyan
				glow.Material = Enum.Material.Neon
				glow.Transparency = 0.4
				glow.CanCollide = false
				glow.Parent = plot
			end
		end
	end
end

-- Corridors: add neon floor lights along each corridor
if corridorsFolder then
	for _, p in ipairs(corridorsFolder:GetChildren()) do
		if p:IsA("BasePart") and p.Name:match("^Strip_") then
			-- Add small point lights along strips
			local pl = Instance.new("PointLight")
			pl.Name = "StripLight"
			pl:SetAttribute("VisualPolish", true)
			pl.Color = p.Color
			pl.Brightness = 1.2
			pl.Range = 20
			pl.Shadows = false
			pl.Parent = p
		end
	end
end

-- ================================================================
--  4. ADD EXTRA NEON ACCENTS — more color, more life
-- ================================================================
print("[MutationLab] Adding neon accents...")

-- Lobby: colored ring lights on the floor
if lobbyFolder then
	local floor = lobbyFolder:FindFirstChild("Floor")
	if floor then
		local ringColors = {BRIGHT.neonGreen, BRIGHT.neonCyan, BRIGHT.neonPurple}
		local ringRadii = {18, 28, 36}
		for ri = 1, 3 do
			local segments = 12
			for s = 1, segments do
				local a = (s / segments) * math.pi * 2
				local rx = ringRadii[ri] * math.cos(a)
				local rz = ringRadii[ri] * math.sin(a)
				local dot = Instance.new("Part")
				dot.Name = "RingDot_" .. ri .. "_" .. s
				dot:SetAttribute("VisualPolish", true)
				dot.Anchored = true
				dot.Size = Vector3.new(1.2, 0.25, 1.2)
				dot.Shape = Enum.PartType.Cylinder
				dot.CFrame = CFrame.new(rx, 10 + 1 + 0.12, rz)
					* CFrame.Angles(0, 0, math.rad(90))
				dot.Color = ringColors[ri]
				dot.Material = Enum.Material.Neon
				dot.Transparency = 0.2
				dot.CanCollide = false
				dot.CastShadow = false
				dot.Parent = lobbyFolder
			end
		end
	end
end

-- Labs: add glowing edge strips on the floor inside each lab
if plotsFolder then
	for i = 1, 8 do
		local plot = plotsFolder:FindFirstChild("Plot_" .. i)
		if not plot then continue end
		local flr = plot:FindFirstChild("Floor")
		if not flr then continue end

		-- Side glow strips (left + right inner floor)
		local plotCF = flr.CFrame
		local colors = {BRIGHT.neonGreen, BRIGHT.neonCyan, BRIGHT.neonPurple, BRIGHT.neonPink}
		local labColor = colors[((i - 1) % #colors) + 1]

		for _, side in ipairs({-1, 1}) do
			local strip = Instance.new("Part")
			strip.Name = "FloorStrip_" .. (side < 0 and "L" or "R")
			strip:SetAttribute("VisualPolish", true)
			strip.Anchored = true
			strip.Size = Vector3.new(0.8, 0.2, 50)
			strip.CFrame = plotCF * CFrame.new(side * 28, 1.1, 0)
			strip.Color = labColor
			strip.Material = Enum.Material.Neon
			strip.Transparency = 0.25
			strip.CanCollide = false
			strip.CastShadow = false
			strip.Parent = plot

			local pl = Instance.new("PointLight")
			pl:SetAttribute("VisualPolish", true)
			pl.Color = labColor
			pl.Brightness = 0.8
			pl.Range = 18
			pl.Shadows = false
			pl.Parent = strip
		end

		-- Center aisle strip
		local center = Instance.new("Part")
		center.Name = "CenterStrip"
		center:SetAttribute("VisualPolish", true)
		center.Anchored = true
		center.Size = Vector3.new(0.6, 0.2, 40)
		center.CFrame = plotCF * CFrame.new(0, 1.1, 3)
		center.Color = labColor
		center.Material = Enum.Material.Neon
		center.Transparency = 0.35
		center.CanCollide = false
		center.CastShadow = false
		center.Parent = plot
	end
end

-- ================================================================
--  5. CLIENT-SIDE AMBIENT ANIMATION — pulsing, floating, alive
-- ================================================================
print("[MutationLab] Creating ambient animation script...")
if spsFolder then
	local fxScript = Instance.new("LocalScript")
	fxScript.Name = "AmbientFX"
	fxScript.Source = [=[
local TS = game:GetService("TweenService")
local RS = game:GetService("RunService")
local mlRoot = workspace:WaitForChild("MutationLab")
local lobbyF = mlRoot:FindFirstChild("Lobby")
local plotsF = mlRoot:FindFirstChild("Plots")

-- Collect neon parts to animate
local neonParts = {}
local function collectNeon(parent)
	for _, d in ipairs(parent:GetDescendants()) do
		if d:IsA("BasePart") and d.Material == Enum.Material.Neon
			and d.Transparency < 0.8 and d:GetAttribute("VisualPolish") then
			table.insert(neonParts, {
				part = d,
				baseTransparency = d.Transparency,
				phase = math.random() * math.pi * 2,
				speed = 0.4 + math.random() * 0.6,
			})
		end
	end
end
collectNeon(mlRoot)

-- Pulse center column
local centerCol = lobbyF and lobbyF:FindFirstChild("CentreColumn")
local centerLight = centerCol and centerCol:FindFirstChildOfClass("PointLight")

-- Animate
local elapsed = 0
RS.Heartbeat:Connect(function(dt)
	elapsed = elapsed + dt

	-- Pulse neon parts (subtle transparency wave)
	for _, data in ipairs(neonParts) do
		local wave = math.sin(elapsed * data.speed + data.phase) * 0.08
		data.part.Transparency = math.clamp(data.baseTransparency + wave, 0, 0.9)
	end

	-- Pulse center column light
	if centerLight then
		centerLight.Brightness = 4 + math.sin(elapsed * 0.8) * 1.5
		centerLight.Range = 100 + math.sin(elapsed * 0.5) * 25
	end

	-- Slowly shift center column color
	if centerCol then
		local hue = (elapsed * 0.02) % 1
		-- Green → Cyan → back cycle
		local r = math.floor(math.clamp(math.sin(hue * math.pi * 2 + 2) * 60, 0, 60))
		local g = math.floor(200 + math.sin(hue * math.pi * 2) * 55)
		local b = math.floor(120 + math.sin(hue * math.pi * 2 + 1) * 80)
		centerCol.Color = Color3.fromRGB(r, g, b)
	end
end)

-- Pulse lab lights (slow color temperature shift)
if plotsF then
	for i = 1, 8 do
		local plot = plotsF:FindFirstChild("Plot_" .. i)
		if plot then
			local labLight = plot:FindFirstChild("LabLight")
			if labLight then
				task.spawn(function()
					while labLight.Parent do
						TS:Create(labLight, TweenInfo.new(3, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut), {
							Color = Color3.fromRGB(0, 220, 255),
						}):Play()
						task.wait(3)
						TS:Create(labLight, TweenInfo.new(3, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut), {
							Color = Color3.fromRGB(0, 255, 140),
						}):Play()
						task.wait(3)
						TS:Create(labLight, TweenInfo.new(3, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut), {
							Color = Color3.fromRGB(140, 200, 255),
						}):Play()
						task.wait(3)
					end
				end)
			end

			-- Pulse machine idle glow
			local machine = plot:FindFirstChild("MutationMachine")
			if machine then
				local cg = machine:FindFirstChild("ChamberGlow")
				if cg then
					task.spawn(function()
						while cg.Parent do
							TS:Create(cg, TweenInfo.new(2, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut), {
								Transparency = 0.25,
							}):Play()
							task.wait(2)
							TS:Create(cg, TweenInfo.new(2, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut), {
								Transparency = 0.5,
							}):Play()
							task.wait(2)
						end
					end)
				end
			end
		end
	end
end

-- Lobby inner glow ring pulse
if lobbyF then
	local innerGlow = lobbyF:FindFirstChild("InnerGlow")
	if innerGlow then
		task.spawn(function()
			while innerGlow.Parent do
				TS:Create(innerGlow, TweenInfo.new(2, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut), {
					Color = Color3.fromRGB(0, 255, 180),
					Transparency = 0.1,
				}):Play()
				task.wait(2)
				TS:Create(innerGlow, TweenInfo.new(2, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut), {
					Color = Color3.fromRGB(0, 200, 255),
					Transparency = 0.25,
				}):Play()
				task.wait(2)
			end
		end)
	end
end

print("[AmbientFX] Visual effects active")
]=]
	fxScript.Parent = spsFolder
end

-- ================================================================
--  DONE
-- ================================================================
print("========================================")
print("[MutationLab] Visual Polish applied!")
print("  Lighting ......... Brighter ambient, stronger bloom")
print("  Surfaces ......... All walls/floors brightened 40%+")
print("  Neon ............. More vibrant, cyan/pink accents added")
print("  Particles ........ Ambient motes in lobby + each lab")
print("  Floor Accents .... Neon rings, glow strips, entrance glow")
print("  Animations ....... Pulsing neon, color-cycling lights,")
print("                     breathing machine glow")
print("  Atmosphere ....... Less fog, more stars, depth of field")
print("========================================")
print("Press F5 to see the difference!")
