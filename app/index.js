'use strict';

const _ = require('lodash');
const fs = require('fs-extra');
const conf = fs.readJsonSync('/tunnels/config.json');
const { spawn, execSync } = require('child_process');
const prettyjson = require('prettyjson');

function rand(min = 0, max = 0) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

_.defaults(conf, {
    'tunnels': []
});

const tunnels = [];

conf.tunnels.forEach((tunnel) => {

    if (tunnel.through_ssh_user && tunnel.through_ssh_host && tunnel.through_ssh_port && tunnel.through_tunnel_port) {
    
		tunnel2 = _.cloneDeep(tunnel);
		tunnel2.ssh_user = tunnel2.through_ssh_user;
		tunnel2.ssh_host = tunnel2.through_ssh_host;
		tunnel2.ssh_port = tunnel2.through_ssh_port;
		tunnel2.local_port = tunnel2.through_local_port;
		tunnel2.ssh_identity_file = tunnel2.through_ssh_identity_file;
		
		delete tunnel2.through_ssh_user;
		delete tunnel2.through_ssh_host;
		delete tunnel2.through_ssh_port;
		delete tunnel2.through_ssh_identity_file;
		delete tunnel2.through_local_port;
		
		tunnels.push(tunnel2);
		
    } else {
    
    	tunnels.push(tunnel);
    
    }
    
});

// throughs.forEach((tunnel) => {
//
//     const idx = conf.tunnels.indexOf(tunnel);
//
//     tunnel2 = _.cloneDeep(tunnel);
//     tunnel2.ssh_host = tunnel2.through_ssh_host;
//     tunnel2.ssh_user = tunnel2.through_ssh_user;
//     tunnel2.ssh_port = tunnel2.through_ssh_port;
//
// });

let monitorPort = conf.monitor_port;

if (!monitorPort) {
    monitorPort = rand(40000, 60000);
}

conf.tunnels.forEach((tunnel, k) => {
    
    _.defaults(tunnel, {
        'ssh_port': 22
    });
    
    const tmpKey = `/tmp/key${k}.pem`;    
    fs.copySync(tunnel.ssh_identity_file, tmpKey);
    
    execSync(`chmod 0600 ${tmpKey}`);
    
    const args = [
    	'-M',
    	monitorPort,
        '-N',
        `${tunnel.ssh_user}@${tunnel.ssh_host}`,
        '-L',
        `0.0.0.0:${tunnel.local_port}:${tunnel.dest_host}:${tunnel.dest_port}`,
        '-o',
        'StrictHostKeyChecking=no',
        '-o',
        "UserKnownHostsFile=/dev/null",
        '-p',
        tunnel.ssh_port,
        '-i',
        tmpKey
    ];
    
    const child = spawn('autossh', args, {
    	'env': {
	    	'AUTOSSH_GATETIME': '0',
	    	'AUTOSSH_DEBUG': '1',
	    	'AUTOSSH_POLL': '10'
    	}
    });
    
    child.stderr.on('data', (data) => {
        console.log(data.toString('utf8'));
    });
    
    child.stdout.on('data', (data) => {
        console.log(data.toString('utf8'));
    });
    
    child.on('close', (code) => {
        console.log('Tunnel unexpectedly closed:');
        console.log('');
        console.log(prettyjson.render(tunnel));
        console.log('');
    });
    
    monitorPort = monitorPort + 10;
    
});

console.log(`${conf.tunnels.length} SSH tunnel(s) created:`);
console.log('');
console.log(prettyjson.render(conf.tunnels));
console.log('');