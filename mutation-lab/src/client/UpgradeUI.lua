-- LocalScript: StarterPlayer/StarterPlayerScripts/MutationLab/UpgradeUI
-- Upgrade panel UI — opens from upgrade terminal ProximityPrompt,
-- shows upgrade cards with level bars and purchase buttons.

local Players = game:GetService("Players")
local TS = game:GetService("TweenService")
local RS = game:GetService("ReplicatedStorage")
local player = Players.LocalPlayer
local pGui = player:WaitForChild("PlayerGui")
local ml = RS:WaitForChild("MutationLab")
local UpgradeRequest = ml:WaitForChild("UpgradeRequest")
local UpgradeUpdate = ml:WaitForChild("UpgradeUpdate")

local upgrades = {}

local gui = Instance.new("ScreenGui")
gui.Name="UpgradeUI"; gui.ResetOnSpawn=false
gui.ZIndexBehavior=Enum.ZIndexBehavior.Sibling; gui.Parent=pGui

local overlay = Instance.new("Frame")
overlay.Name="Overlay"
overlay.Size=UDim2.new(1,0,1,0)
overlay.BackgroundColor3=Color3.new(0,0,0)
overlay.BackgroundTransparency=0.5
overlay.BorderSizePixel=0
overlay.Visible=false; overlay.Parent=gui

local panel = Instance.new("Frame")
panel.Name="UpgradePanel"
panel.Size=UDim2.new(0,340,0,380)
panel.Position=UDim2.new(0.5,-170,0.5,-190)
panel.BackgroundColor3=Color3.fromRGB(14,14,28)
panel.BorderSizePixel=0; panel.Parent=overlay
Instance.new("UICorner",panel).CornerRadius=UDim.new(0,12)
local pStroke=Instance.new("UIStroke")
pStroke.Color=Color3.fromRGB(160,40,255); pStroke.Thickness=2; pStroke.Parent=panel

local header = Instance.new("Frame")
header.Size=UDim2.new(1,0,0,44)
header.BackgroundColor3=Color3.fromRGB(24,20,42)
header.BorderSizePixel=0; header.Parent=panel
Instance.new("UICorner",header).CornerRadius=UDim.new(0,12)

local hdrText = Instance.new("TextLabel")
hdrText.Size=UDim2.new(1,-44,1,0); hdrText.Position=UDim2.new(0,12,0,0)
hdrText.BackgroundTransparency=1; hdrText.TextColor3=Color3.fromRGB(160,40,255)
hdrText.Font=Enum.Font.GothamBold; hdrText.TextSize=17
hdrText.TextXAlignment=Enum.TextXAlignment.Left
hdrText.Text="LAB UPGRADES"; hdrText.Parent=header

local closeBtn = Instance.new("TextButton")
closeBtn.Size=UDim2.new(0,30,0,30); closeBtn.Position=UDim2.new(1,-37,0,7)
closeBtn.BackgroundColor3=Color3.fromRGB(160,40,40)
closeBtn.BorderSizePixel=0; closeBtn.TextColor3=Color3.new(1,1,1)
closeBtn.Font=Enum.Font.GothamBold; closeBtn.TextSize=14
closeBtn.Text="X"; closeBtn.Parent=header
Instance.new("UICorner",closeBtn).CornerRadius=UDim.new(0,6)

local scroll = Instance.new("ScrollingFrame")
scroll.Size=UDim2.new(1,-12,1,-54)
scroll.Position=UDim2.new(0,6,0,48)
scroll.BackgroundTransparency=1
scroll.ScrollBarThickness=4
scroll.ScrollBarImageColor3=Color3.fromRGB(160,40,255)
scroll.BorderSizePixel=0
scroll.CanvasSize=UDim2.new(0,0,0,0)
scroll.Parent=panel

local layout = Instance.new("UIListLayout")
layout.SortOrder=Enum.SortOrder.LayoutOrder
layout.Padding=UDim.new(0,6); layout.Parent=scroll

layout:GetPropertyChangedSignal("AbsoluteContentSize"):Connect(function()
	scroll.CanvasSize=UDim2.new(0,0,0,layout.AbsoluteContentSize.Y+8)
end)

local function showPanel()
	overlay.Visible = true
	panel.Size = UDim2.new(0,10,0,10)
	panel.Position = UDim2.new(0.5,-5,0.5,-5)
	TS:Create(panel,TweenInfo.new(0.3,Enum.EasingStyle.Back),{
		Size=UDim2.new(0,340,0,380),
		Position=UDim2.new(0.5,-170,0.5,-190),
	}):Play()
end

local function hidePanel()
	TS:Create(panel,TweenInfo.new(0.2,Enum.EasingStyle.Quad,Enum.EasingDirection.In),{
		Size=UDim2.new(0,10,0,10),
		Position=UDim2.new(0.5,-5,0.5,-5),
	}):Play()
	task.delay(0.25, function()
		overlay.Visible = false
	end)
end

closeBtn.MouseButton1Click:Connect(hidePanel)
overlay.InputBegan:Connect(function(input)
	if input.UserInputType == Enum.UserInputType.MouseButton1
		or input.UserInputType == Enum.UserInputType.Touch then
		local pos = input.Position
		local pAbs = panel.AbsolutePosition
		local pSz = panel.AbsoluteSize
		if pos.X < pAbs.X or pos.X > pAbs.X + pSz.X
			or pos.Y < pAbs.Y or pos.Y > pAbs.Y + pSz.Y then
			hidePanel()
		end
	end
end)

local function createUpgradeCard(uData, order)
	local card = Instance.new("Frame")
	card.Size=UDim2.new(1,-8,0,74)
	card.BackgroundColor3=Color3.fromRGB(26,24,44)
	card.BorderSizePixel=0
	card.LayoutOrder=order; card.Parent=scroll
	Instance.new("UICorner",card).CornerRadius=UDim.new(0,8)
	local cs=Instance.new("UIStroke")
	cs.Color=Color3.fromRGB(60,50,90); cs.Thickness=1; cs.Parent=card

	local icon = Instance.new("TextLabel")
	icon.Size=UDim2.new(0,36,0,36); icon.Position=UDim2.new(0,8,0,8)
	icon.BackgroundColor3=Color3.fromRGB(40,36,64)
	icon.BorderSizePixel=0
	icon.TextColor3=Color3.new(1,1,1)
	icon.Font=Enum.Font.GothamBold; icon.TextSize=20
	icon.Text=uData.icon or "?"; icon.Parent=card
	Instance.new("UICorner",icon).CornerRadius=UDim.new(0,8)

	local nm = Instance.new("TextLabel")
	nm.Size=UDim2.new(1,-130,0,20); nm.Position=UDim2.new(0,52,0,6)
	nm.BackgroundTransparency=1
	nm.TextColor3=Color3.fromRGB(220,200,255)
	nm.Font=Enum.Font.GothamBold; nm.TextSize=13
	nm.TextXAlignment=Enum.TextXAlignment.Left
	nm.Text=uData.name; nm.Parent=card

	local desc = Instance.new("TextLabel")
	desc.Size=UDim2.new(1,-130,0,16); desc.Position=UDim2.new(0,52,0,26)
	desc.BackgroundTransparency=1
	desc.TextColor3=Color3.fromRGB(140,130,170)
	desc.Font=Enum.Font.Gotham; desc.TextSize=11
	desc.TextXAlignment=Enum.TextXAlignment.Left
	desc.Text=uData.desc; desc.Parent=card

	local barBg = Instance.new("Frame")
	barBg.Size=UDim2.new(1,-120,0,8); barBg.Position=UDim2.new(0,52,0,46)
	barBg.BackgroundColor3=Color3.fromRGB(30,28,50)
	barBg.BorderSizePixel=0; barBg.Parent=card
	Instance.new("UICorner",barBg).CornerRadius=UDim.new(0,4)

	local barFill = Instance.new("Frame")
	local fillPct = uData.maxLevel > 0 and (uData.level / uData.maxLevel) or 0
	barFill.Size=UDim2.new(fillPct,0,1,0)
	barFill.BackgroundColor3=Color3.fromRGB(160,40,255)
	barFill.BorderSizePixel=0; barFill.Parent=barBg
	Instance.new("UICorner",barFill).CornerRadius=UDim.new(0,4)

	local lvlText = Instance.new("TextLabel")
	lvlText.Size=UDim2.new(0,50,0,16); lvlText.Position=UDim2.new(1,-58,0,44)
	lvlText.BackgroundTransparency=1
	lvlText.TextColor3=Color3.fromRGB(160,40,255)
	lvlText.Font=Enum.Font.GothamBold; lvlText.TextSize=11
	lvlText.Text="Lv " .. uData.level .. "/" .. uData.maxLevel
	lvlText.Parent=card

	local btn = Instance.new("TextButton")
	btn.Size=UDim2.new(0,72,0,30); btn.Position=UDim2.new(1,-80,0,8)
	btn.BorderSizePixel=0
	btn.Font=Enum.Font.GothamBold; btn.TextSize=12
	btn.Parent=card
	Instance.new("UICorner",btn).CornerRadius=UDim.new(0,6)

	if uData.maxed then
		btn.Text="MAXED"
		btn.BackgroundColor3=Color3.fromRGB(60,50,90)
		btn.TextColor3=Color3.fromRGB(140,130,170)
	else
		btn.Text=tostring(uData.cost)
		btn.BackgroundColor3=Color3.fromRGB(120,30,200)
		btn.TextColor3=Color3.new(1,1,1)
		btn.MouseButton1Click:Connect(function()
			UpgradeRequest:FireServer(uData.id)
		end)
	end

	return card
end

local function refreshUI()
	for _, child in ipairs(scroll:GetChildren()) do
		if child:IsA("Frame") then child:Destroy() end
	end
	for i, u in ipairs(upgrades) do
		createUpgradeCard(u, i)
	end
end

UpgradeUpdate.OnClientEvent:Connect(function(data)
	upgrades = data or {}
	refreshUI()
end)

task.defer(function()
	local plotsFld = workspace:WaitForChild("MutationLab"):WaitForChild("Plots")
	for i = 1, 8 do
		local plot = plotsFld:FindFirstChild("Plot_" .. i)
		if plot then
			local terminal = plot:FindFirstChild("UpgradeTerminal")
			if terminal then
				for _, d in ipairs(terminal:GetDescendants()) do
					if d:IsA("ProximityPrompt") then
						d.Triggered:Connect(function()
							if overlay.Visible then
								hidePanel()
							else
								showPanel()
							end
						end)
						break
					end
				end
			end
		end
	end
end)
