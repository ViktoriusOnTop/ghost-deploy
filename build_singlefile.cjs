const fs = require('fs');
const path = require('path');
const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', reject);
  });
}

async function build() {
  try {
    const dogeFile = path.join('C:', 'Users', 'yashs', 'OneDrive', 'Documents', 'dogeub', 'src', 'data', 'apps.json');
    const dogeData = JSON.parse(fs.readFileSync(dogeFile, 'utf-8'));
    
    // Flatten doge games
    const dogeGamesList = [];
    if (dogeData && dogeData.games) {
      for (const cat in dogeData.games) {
        dogeData.games[cat].forEach(g => {
          if (g.appName && g.appName !== 'Placeholder') {
            dogeGamesList.push({
              title: g.appName,
              image: g.icon,
              url: g.url
            });
          }
        });
      }
    }

    console.log('Fetching GN Math games...');
    const gnMathData = await fetchJson('https://vapor.onl/asset/json/zones/gnmath.json');
    const gnMathList = (gnMathData || []).map(g => ({
      title: g.name || g.title,
      image: g.image || g.icon || g.cover,
      url: g.url
    }));

    // User didn't link gnports specifically but said GN Port games
    // Assuming same URL path
    let gnPortsList = [];
    try {
      console.log('Fetching GN Ports games...');
      const gnPortsData = await fetchJson('https://vapor.onl/asset/json/zones/gnports.json');
      gnPortsList = (gnPortsData || []).map(g => ({
        title: g.name || g.title,
        image: g.image || g.icon || g.cover,
        url: g.url
      }));
    } catch(e) {
      console.log('Failed to fetch gnports.json, skipping.', e.message);
    }

    const allGames = [...dogeGamesList, ...gnMathList, ...gnPortsList];

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GhostProxy - SingleFile Games</title>
<style>
  body { margin: 0; padding: 0; font-family: 'Inter', system-ui, sans-serif; background-color: #0f141c; color: #e2e8f0; }
  .header { padding: 20px 40px; background-color: rgba(0,0,0,0.3); border-bottom: 1px solid rgba(255,255,255,0.1); }
  .header h1 { margin: 0; font-size: 1.5rem; }
  .search-container { padding: 20px 40px; }
  .search-container input { width: 100%; max-width: 400px; padding: 12px 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background-color: rgba(255,255,255,0.05); color: white; outline: none; }
  .search-container input:focus { border-color: #3b82f6; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 20px; padding: 0 40px 40px 40px; }
  .card { background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; overflow: hidden; cursor: pointer; transition: transform 0.2s, background-color 0.2s; }
  .card:hover { transform: translateY(-4px); background-color: rgba(255,255,255,0.08); }
  .card img { width: 100%; height: 140px; object-fit: cover; background-color: #000; }
  .card .info { padding: 12px; }
  .card .title { margin: 0; font-size: 0.95rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
</head>
<body>
  <div class="header"><h1>GhostProxy Games</h1></div>
  <div class="search-container"><input type="text" id="searchInput" placeholder="Search games..." /></div>
  <div class="grid" id="gamesGrid"></div>
  <script>
    const games = ${JSON.stringify(allGames)};
    const grid = document.getElementById('gamesGrid');
    const searchInput = document.getElementById('searchInput');

    function renderGames(filterText = '') {
      grid.innerHTML = '';
      const lowerFilter = filterText.toLowerCase();
      const filtered = games.filter(g => g && g.title && g.title.toLowerCase().includes(lowerFilter));
      
      filtered.forEach(game => {
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => {
          let targetUrl = game.url;
          if (targetUrl) {
            document.body.innerHTML = '<div style="position:fixed;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#000;color:#fff;z-index:99999;">Loading Game...</div>';
            fetch(targetUrl).then(res => res.text()).then(html => {
              document.body.innerHTML = '';
              const iframe = document.createElement('iframe');
              iframe.style.position = 'fixed';
              iframe.style.top = '0';
              iframe.style.left = '0';
              iframe.style.width = '100%';
              iframe.style.height = '100%';
              iframe.style.border = 'none';
              iframe.style.zIndex = '999999';
              iframe.srcdoc = html;
              document.body.appendChild(iframe);
              
              const btn = document.createElement('button');
              btn.innerText = 'Back to Games';
              btn.style.position = 'fixed';
              btn.style.top = '10px';
              btn.style.left = '10px';
              btn.style.zIndex = '999999999';
              btn.style.padding = '8px 16px';
              btn.style.background = 'rgba(0,0,0,0.7)';
              btn.style.color = 'white';
              btn.style.border = '1px solid rgba(255,255,255,0.2)';
              btn.style.borderRadius = '6px';
              btn.style.cursor = 'pointer';
              btn.onclick = () => location.reload();
              document.body.appendChild(btn);
            }).catch(e => {
              alert('Failed to load game.');
              location.reload();
            });
          }
        };

        const img = document.createElement('img');
        img.src = game.image || '/ghost.png';
        img.loading = 'lazy';
        img.onerror = () => { img.src = '/ghost.png'; };

        const info = document.createElement('div');
        info.className = 'info';
        
        const title = document.createElement('p');
        title.className = 'title';
        title.innerText = game.title;

        info.appendChild(title);
        card.appendChild(img);
        card.appendChild(info);
        grid.appendChild(card);
      });
    }

    searchInput.addEventListener('input', (e) => renderGames(e.target.value));
    renderGames();
  </script>
</body>
</html>`;

    fs.writeFileSync(path.join(__dirname, 'singlefile.html'), html, 'utf-8');
    console.log('Successfully built singlefile.html');
  } catch(e) {
    console.error('Error building singlefile.html:', e);
  }
}

build();
