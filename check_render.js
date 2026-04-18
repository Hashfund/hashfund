const https = require('https');

const token = 'rnd_sr5afi77S6ylWwW0ibHCjGy1z98e';

const options = {
  hostname: 'api.render.com',
  port: 443,
  path: '/v1/services',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      const targetServices = parsed.filter(item => 
        item.service.name.includes('api') || 
        item.service.name.includes('watchdog')
      );

      console.log('--- Render Services ---');
      targetServices.forEach(s => {
        console.log(`Service: ${s.service.name}`);
        console.log(`ID: ${s.service.id}`);
        console.log(`Suspended: ${s.service.suspended}`);
        
        checkDeploy(s.service.id, s.service.name);
      });
    } catch (e) {
      console.error('Error parsing:', e.message);
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error(e);
});
req.end();

function checkDeploy(id, name) {
  const depOptions = {
    hostname: 'api.render.com',
    port: 443,
    path: `/v1/services/${id}/deploys?limit=1`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  };

  const req = https.request(depOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        if (parsed.length > 0) {
          const deploy = parsed[0].deploy;
          console.log(`\n[${name}] Latest Deploy:`);
          console.log(`ID: ${deploy.id}`);
          console.log(`Status: ${deploy.status}`);
          console.log(`Commit: ${deploy.commit.message || 'N/A'} (${deploy.commit.id || ''})`);
        } else {
          console.log(`\n[${name}] No deploys found.`);
        }
      } catch (e) {
        console.error('Error fetching deploys for', name);
      }
    });
  });
  req.end();
}
