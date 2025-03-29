<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Roblox Executor-Ready Obfuscator</title>
    <link rel="icon" type="image/x-icon" href="https://raw.githubusercontent.com/Website-Tree/Website-Tree.github.io/refs/heads/main/Roblox-Lua-Encoder/Image/icon.ico">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/themes/prism-tomorrow.min.css" rel="stylesheet" />
    <style>
        body {
            font-family: 'Segoe UI', sans-serif;
            background: #0f0f0f;
            color: #fff;
            margin: 0;
            padding: 20px;
            overflow-x: hidden;
        }
        
        #particles-js {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
        }

        .container {
            position: relative;
            max-width: 900px;
            margin: 0 auto;
            background: rgba(26, 26, 26, 0.9);
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
            z-index: 1;
        }

        .fullscreen-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(26, 26, 26, 0.98);
            z-index: 1000;
            padding: 20px;
        }

        .fullscreen-content {
            width: 100%;
            height: calc(100% - 40px);
        }

        .close-fullscreen {
            position: absolute;
            top: 10px;
            right: 10px;
            color: #fff;
            background: #aa0000;
            border: none;
            padding: 5px 15px;
            border-radius: 5px;
            cursor: pointer;
        }

        .fullscreen-btn {
            position: absolute;
            top: 5px;
            right: 5px;
            background: #444;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 3px;
            cursor: pointer;
            z-index: 2;
        }

        .code-wrapper {
            position: relative;
            margin: 15px 0;
            height: 350px;
            background: #2d2d2d;
            border-radius: 5px;
            border: 1px solid #444;
        }

        #input, #output, #input-fs, #output-fs {
            width: 100%;
            height: 100%;
            padding: 15px;
            background: transparent;
            color: #00ff00;
            border: none;
            font-family: 'Consolas', monospace;
            font-size: 14px;
            line-height: 1.5;
            tab-size: 4;
            resize: none;
            overflow: auto;
        }

        #input, #input-fs {
            color: transparent;
            caret-color: #00ff00;
        }

        .editor-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            overflow: auto;
            padding: 15px;
        }

        pre {
            margin: 0;
            background: transparent !important;
        }

        code {
            background: transparent !important;
        }

        button {
            background: #00aa00;
            color: white;
            border: none;
            padding: 15px 30px;
            cursor: pointer;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
            transition: all 0.3s ease;
        }

        button:hover {
            background: #008800;
            transform: scale(1.05);
        }

        code[class*="language-"] {
            font-family: 'Consolas', monospace;
            font-size: 14px;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <div id="particles-js"></div>
    <div class="container">
        <h1>Roblox Executor-Ready Obfuscator</h1>
        
        <div id="input-fullscreen" class="fullscreen-overlay">
            <button class="close-fullscreen" onclick="closeFullscreen('input')">X</button>
            <div class="fullscreen-content">
                <div class="code-wrapper">
                    <textarea id="input-fs" spellcheck="false"></textarea>
                    <div class="editor-overlay">
                        <pre><code class="language-lua" id="highlight-content-fs"></code></pre>
                    </div>
                </div>
            </div>
        </div>

        <div id="output-fullscreen" class="fullscreen-overlay">
            <button class="close-fullscreen" onclick="closeFullscreen('output')">X</button>
            <div class="fullscreen-content">
                <textarea id="output-fs" readonly></textarea>
            </div>
        </div>

        <div class="code-wrapper">
            <button class="fullscreen-btn" onclick="openFullscreen('input')">⛶</button>
            <textarea id="input" spellcheck="false"></textarea>
            <div class="editor-overlay">
                <pre><code class="language-lua" id="highlight-content"></code></pre>
            </div>
        </div>

        <button onclick="obfuscateForExecutor()">Obfuscate Code</button>

        <div class="code-wrapper">
            <button class="fullscreen-btn" onclick="openFullscreen('output')">⛶</button>
            <textarea id="output" readonly></textarea>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/prism.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/components/prism-lua.min.js"></script>
    
    <script>
        particlesJS("particles-js", {
            particles: {
                number: {
                    value: 200,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: "#ffffff"
                },
                shape: {
                    type: "circle"
                },
                opacity: {
                    value: 0.7,
                    random: true
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 3,
                        size_min: 0.3,
                        sync: false
                    }
                },
                line_linked: {
                    enable: false
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: "bottom",
                    random: true,
                    straight: false,
                    out_mode: "out",
                    bounce: false
                }
            }
        });

        const input = document.getElementById('input');
        const highlightContent = document.getElementById('highlight-content');

        input.addEventListener('input', updateHighlighting);
        input.addEventListener('scroll', syncScroll);

        function syncScroll() {
            const overlay = document.querySelector('.editor-overlay');
            overlay.scrollTop = input.scrollTop;
            overlay.scrollLeft = input.scrollLeft;
        }

        function updateHighlighting() {
            const code = input.value;
            highlightContent.textContent = code;
            Prism.highlightElement(highlightContent);
        }

        function updateHighlightingFS() {
            const code = document.getElementById('input-fs').value;
            const highlightContent = document.getElementById('highlight-content-fs');
            highlightContent.textContent = code;
            Prism.highlightElement(highlightContent);
        }

        function openFullscreen(type) {
            const fullscreenElement = document.getElementById(`${type}-fullscreen`);
            const originalTextarea = document.getElementById(type);
            const fullscreenTextarea = document.getElementById(`${type}-fs`);
            
            fullscreenElement.style.display = 'block';
            fullscreenTextarea.value = originalTextarea.value;
            
            if (type === 'input') {
                updateHighlightingFS();
            }
        }

        function closeFullscreen(type) {
            const fullscreenElement = document.getElementById(`${type}-fullscreen`);
            const originalTextarea = document.getElementById(type);
            const fullscreenTextarea = document.getElementById(`${type}-fs`);
            
            originalTextarea.value = fullscreenTextarea.value;
            fullscreenElement.style.display = 'none';
            
            if (type === 'input') {
                updateHighlighting();
            }
        }

        function generateVarName() {
            return '_' + Math.random().toString(36).substr(2, 9);
        }

        function obfuscateForExecutor() {
            let code = document.getElementById('input').value;
            
            const vars = {
                load: generateVarName(),
                byte: generateVarName(),
                char: generateVarName(),
                sub: generateVarName(),
                key: generateVarName()
            };

            code = code.replace(/(".*?")/g, function(match) {
                const str = match.slice(1, -1);
                const bytes = [];
                for(let i = 0; i < str.length; i++) {
                    bytes.push(str.charCodeAt(i));
                }
                return `string.char(${bytes.join(',')})`;
            });

            const obfuscated = `
local ${vars.load} = loadstring or load;
local ${vars.byte} = string.byte;
local ${vars.char} = string.char;
local ${vars.sub} = string.sub;
local ${vars.key} = ${Math.floor(Math.random() * 1000)};

local code = [[
${code}
]];

${vars.load}(code)();`.trim();

            document.getElementById('output').value = obfuscated;
        }

        document.getElementById('input-fs').addEventListener('input', updateHighlightingFS);
        updateHighlighting();
    </script>
</body>
</html>
