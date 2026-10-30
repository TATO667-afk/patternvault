-- ModuleScript: ReplicatedStorage/MutationLab/CreatureData
-- Name generation tables for procedural creatures.

local CD = {}
CD.PREFIXES = {
	"Glow","Shadow","Crystal","Neon","Void","Plasma","Toxic","Frost",
	"Ember","Storm","Lunar","Solar","Spectral","Prismatic","Quantum",
	"Arcane","Crimson","Azure","Jade","Amber","Obsidian","Radiant",
}
CD.SUFFIXES = {
	"Blob","Mite","Wisp","Fang","Shell","Core","Crawler","Sprite",
	"Drake","Golem","Wraith","Flux","Slime","Crab","Pup","Orb",
	"Shard","Beast","Moth","Worm","Jelly","Fox","Hound","Beetle",
}
function CD.generateName(seed)
	local rng = Random.new(seed)
	local p = CD.PREFIXES[rng:NextInteger(1, #CD.PREFIXES)]
	local s = CD.SUFFIXES[rng:NextInteger(1, #CD.SUFFIXES)]
	return p .. " " .. s
end
return CD
