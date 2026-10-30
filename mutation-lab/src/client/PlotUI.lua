-- LocalScript: StarterPlayer/StarterPlayerScripts/MutationLab/PlotUI
-- Shows lab assignment banner, persistent HUD with lab indicator + currency display.

local Players = game:GetService("Players")
local TS = game:GetService("TweenService")
local RS = game:GetService("ReplicatedStorage")
local player = Players.LocalPlayer
local pGui = player:WaitForChild("PlayerGui")
local ml = RS:WaitForChild("MutationLab")
local PlotAssigned = ml:WaitForChild("PlotAssigned")
local CurrencyUpdate = ml:WaitForChild("CurrencyUpdate")

local gui = Instance.new("ScreenGui")
gui.Name="PlotUI"; gui.ResetOnSpawn=false
gui.ZIndexBehavior=Enum.ZIndexBehavior.Sibling; gui.Parent=pGui

-- HUD Bar (top-left)
local hud = Instance.new("Frame")
hud.Name="HUD"; hud.Size=UDim2.new(0,260,0,34)
hud.Position=UDim2.new(0,8,0,8)
hud.BackgroundColor3=Color3.fromRGB(12,12,22)
hud.BackgroundTransparency=0.2; hud.BorderSizePixel=0
hud.Visible=false; hud.Parent=gui
Instance.new("UICorner",hud).CornerRadius=UDim.new(0,8)
local hs=Instance.new("UIStroke"); hs.Color=Color3.fromRGB(0,200,100)
hs.Thickness=1; hs.Parent=hud

local labLabel = Instance.new("TextLabel")
labLabel.Size=UDim2.new(0,80,1,0); labLabel.Position=UDim2.new(0,8,0,0)
labLabel.BackgroundTransparency=1; labLabel.TextColor3=Color3.fromRGB(0,255,120)
labLabel.Font=Enum.Font.GothamBold; labLabel.TextSize=14
labLabel.TextXAlignment=Enum.TextXAlignment.Left; labLabel.Text=""
labLabel.Parent=hud

local currLabel = Instance.new("TextLabel")
currLabel.Size=UDim2.new(0,150,1,0)
currLabel.Position=UDim2.new(1,-158,0,0)
currLabel.BackgroundTransparency=1; currLabel.TextColor3=Color3.fromRGB(0,230,110)
currLabel.Font=Enum.Font.GothamBold; currLabel.TextSize=14
currLabel.TextXAlignment=Enum.TextXAlignment.Right; currLabel.Text="Mutagen: ---"
currLabel.Parent=hud

-- Banner
local banner = Instance.new("Frame")
banner.Name="Banner"; banner.Size=UDim2.new(0,340,0,52)
banner.Position=UDim2.new(0.5,-170,0,-56)
banner.BackgroundColor3=Color3.fromRGB(12,12,22)
banner.BorderSizePixel=0; banner.Parent=gui
Instance.new("UICorner",banner).CornerRadius=UDim.new(0,10)
local bsk=Instance.new("UIStroke"); bsk.Color=Color3.fromRGB(0,255,120)
bsk.Thickness=2; bsk.Parent=banner
local bGrad=Instance.new("UIGradient")
bGrad.Color=ColorSequence.new(Color3.fromRGB(0,255,120),Color3.fromRGB(0,180,255))
bGrad.Parent=bsk
local bText=Instance.new("TextLabel")
bText.Name="Text"; bText.Size=UDim2.new(1,-20,1,0)
bText.Position=UDim2.new(0,10,0,0); bText.BackgroundTransparency=1
bText.TextColor3=Color3.fromRGB(0,255,120); bText.Font=Enum.Font.GothamBold
bText.TextSize=18; bText.Text=""; bText.Parent=banner

local function showBanner(text)
	bText.Text=text; banner.Position=UDim2.new(0.5,-170,0,-56)
	TS:Create(banner,TweenInfo.new(0.5,Enum.EasingStyle.Back,Enum.EasingDirection.Out),
		{Position=UDim2.new(0.5,-170,0,14)}):Play()
	task.delay(3.5,function()
		TS:Create(banner,TweenInfo.new(0.3,Enum.EasingStyle.Quad,Enum.EasingDirection.In),
			{Position=UDim2.new(0.5,-170,0,-56)}):Play()
	end)
end

PlotAssigned.OnClientEvent:Connect(function(idx)
	showBanner("Assigned to Lab " .. idx)
	hud.Visible=true; labLabel.Text="Lab " .. idx
end)
CurrencyUpdate.OnClientEvent:Connect(function(amount)
	currLabel.Text="Mutagen: " .. tostring(amount)
	currLabel.TextColor3=Color3.fromRGB(100,255,180)
	TS:Create(currLabel,TweenInfo.new(0.4),{TextColor3=Color3.fromRGB(0,230,110)}):Play()
end)
