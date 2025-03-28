-- Main Configuration
local Config = {
    Debug = true,
    Version = "1.0.0"
}

-- Decoder Function
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

-- Main Execution Handler
local function executeScript()
    local encoded = getfenv().encoded
    if encoded then
        local decodedScript = decodeString(encoded)
        if Config.Debug then
            print("Script decoded successfully!")
        end
        
        local success, result = pcall(function()
            return loadstring(decodedScript)()
        end)
        
        if success then
            if Config.Debug then
                print("Script executed successfully!")
            end
            return result
        else
            warn("Execution error:", result)
        end
    end
end

-- Initialize
local success = executeScript()
if success and Config.Debug then
    print("System initialized successfully!")
end

return function(str)
    if str then
        return decodeString(str)
    end
end
