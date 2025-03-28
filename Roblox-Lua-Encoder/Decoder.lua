local function decode(str)
    local decoded = ""
    local pattern = "X([^Y]+)Y"
    
    for num in str:gmatch(pattern) do
        local charCode = tonumber(num, 36)
        if charCode then
            decoded = decoded .. string.char(charCode)
        end
    end
    
    return loadstring(decoded)()
end

if getfenv().encoded then
    return decode(getfenv().encoded)
end

return decode
