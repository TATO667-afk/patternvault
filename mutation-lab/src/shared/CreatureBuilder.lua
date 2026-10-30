-- ModuleScript: ReplicatedStorage/MutationLab/CreatureBuilder
-- Builds procedural creature models from rarity and seed data.

local CB = {}
local function cp(mdl,name,shape,sz,cf,col,opts)
	local p = Instance.new("Part")
	p.Name=name; p.Shape=shape or Enum.PartType.Block
	p.Size=sz; p.CFrame=cf; p.Color=col
	p.Material=Enum.Material.SmoothPlastic
	p.Anchored=true; p.CanCollide=false
	p.TopSurface=Enum.SurfaceType.Smooth
	p.BottomSurface=Enum.SurfaceType.Smooth
	if opts then
		if opts.n then p.Material=Enum.Material.Neon end
		if opts.t and opts.t>0 then p.Transparency=opts.t end
	end
	p.Parent=mdl; return p
end
local function vc(base,rng,amt)
	amt=amt or 20
	return Color3.fromRGB(
		math.clamp(math.floor(base.R*255)+rng:NextInteger(-amt,amt),0,255),
		math.clamp(math.floor(base.G*255)+rng:NextInteger(-amt,amt),0,255),
		math.clamp(math.floor(base.B*255)+rng:NextInteger(-amt,amt),0,255))
end
function CB.build(data)
	local m = Instance.new("Model")
	m.Name = data.name
	local rng = Random.new(data.seed)
	local ri = data.rarityIndex
	local c = data.color
	local bs = 2.2 + ri*0.3 + rng:NextNumber()*0.5
	-- Body
	local body = cp(m,"Body",Enum.PartType.Ball,
		Vector3.new(bs,bs,bs), CFrame.new(0,bs/2+0.5,0), vc(c,rng))
	m.PrimaryPart = body
	-- Eyes
	local es = 0.35 + ri*0.04
	local ey = bs/2+0.5+bs*0.12
	cp(m,"EyeL",Enum.PartType.Ball,Vector3.new(es,es,es),
		CFrame.new(-bs*0.22,ey,-bs*0.38),Color3.new(0.1,0.1,0.1))
	cp(m,"EyeR",Enum.PartType.Ball,Vector3.new(es,es,es),
		CFrame.new(bs*0.22,ey,-bs*0.38),Color3.new(0.1,0.1,0.1))
	-- Pupils
	cp(m,"PupL",Enum.PartType.Ball,Vector3.new(es*0.45,es*0.45,es*0.45),
		CFrame.new(-bs*0.22,ey+es*0.1,-bs*0.38-es*0.35),Color3.new(1,1,1))
	cp(m,"PupR",Enum.PartType.Ball,Vector3.new(es*0.45,es*0.45,es*0.45),
		CFrame.new(bs*0.22,ey+es*0.1,-bs*0.38-es*0.35),Color3.new(1,1,1))
	-- Rare+: crystal/spike features
	if ri >= 2 then
		local n = ri + rng:NextInteger(0,2)
		for j = 1, n do
			local a = (j/n)*math.pi*2
			local sz = 0.4+ri*0.15+rng:NextNumber()*0.3
			cp(m,"Feat_"..j,Enum.PartType.Block,
				Vector3.new(sz,sz*1.6,sz),
				CFrame.new(math.cos(a)*bs*0.38,bs/2+0.5+rng:NextNumber()*bs*0.25,
					math.sin(a)*bs*0.38)*CFrame.Angles(rng:NextNumber()*0.4,a,rng:NextNumber()*0.4),
				vc(c,rng,30))
		end
	end
	-- Legendary+: wings
	if ri >= 4 then
		for _,wx in ipairs({-1,1}) do
			cp(m,wx<0 and "WingL" or "WingR",Enum.PartType.Block,
				Vector3.new(2.2+ri*0.2,0.15,1.8),
				CFrame.new(wx*(bs*0.45+1.2),bs/2+0.5+bs*0.15,0)
					*CFrame.Angles(0,0,wx*math.rad(22)),
				vc(c,rng,15))
		end
	end
	-- Mythic+: crown
	if ri >= 5 then
		cp(m,"Crown",Enum.PartType.Block,Vector3.new(0.9,0.9,0.9),
			CFrame.new(0,bs+1,0)*CFrame.Angles(0,math.rad(45),0),
			Color3.fromRGB(255,200,50),{n=true})
	end
	-- Secret: ethereal aura + particles
	if ri >= 6 then
		cp(m,"Aura",Enum.PartType.Ball,Vector3.new(bs*1.4,bs*1.4,bs*1.4),
			CFrame.new(0,bs/2+0.5,0),Color3.new(1,1,1),{n=true,t=0.55})
		local pe=Instance.new("ParticleEmitter")
		pe.Color=ColorSequence.new(Color3.new(1,1,1))
		pe.Size=NumberSequence.new({NumberSequenceKeypoint.new(0,0.3),NumberSequenceKeypoint.new(1,0)})
		pe.Lifetime=NumberRange.new(1,2.5); pe.Rate=12
		pe.Speed=NumberRange.new(0.5,2)
		pe.SpreadAngle=Vector2.new(180,180); pe.LightEmission=1
		pe.Parent=body
	end
	-- Glow for Epic+
	if ri >= 3 then
		local pl=Instance.new("PointLight")
		pl.Color=c; pl.Brightness=0.4+ri*0.15; pl.Range=6+ri*2
		pl.Parent=body
	end
	-- Nameplate billboard
	local bb=Instance.new("BillboardGui")
	bb.Name="Label"; bb.Size=UDim2.new(0,120,0,50)
	bb.StudsOffset=Vector3.new(0,bs/2+2,0); bb.AlwaysOnTop=false
	local rl=Instance.new("TextLabel")
	rl.Size=UDim2.new(1,0,0.5,0); rl.BackgroundTransparency=1
	rl.TextColor3=c; rl.Font=Enum.Font.GothamBold
	rl.TextScaled=true; rl.Text=data.rarity
	rl.TextStrokeTransparency=0; rl.TextStrokeColor3=Color3.new(0,0,0)
	rl.Parent=bb
	local nl=Instance.new("TextLabel")
	nl.Size=UDim2.new(1,0,0.45,0); nl.Position=UDim2.new(0,0,0.55,0)
	nl.BackgroundTransparency=1; nl.TextColor3=Color3.fromRGB(220,220,220)
	nl.Font=Enum.Font.Gotham; nl.TextScaled=true; nl.Text=data.name
	nl.TextStrokeTransparency=0; nl.TextStrokeColor3=Color3.new(0,0,0)
	nl.Parent=bb
	bb.Parent=body
	return m
end
return CB
