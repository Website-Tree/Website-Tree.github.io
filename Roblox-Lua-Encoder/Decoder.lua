local function decodeString(str)
    local decoded = ""
    local pattern = "X([^Y]+)Y"
    
    for num in str:gmatch(pattern) do
        local charCode = tonumber(num, 36)
        if charCode then
            decoded = decoded .. string.char(charCode)
        end
    end
    
    return decoded
end

local encoded = getfenv().encoded
if encoded then
    local success, result = pcall(function()
        local decodedScript = decodeString(encoded)
        return loadstring(decodedScript)()
    end)
    
    if not success then
        warn("Decoding failed:", result)
    end
end

return function(str)
    return decodeString(str)
end
