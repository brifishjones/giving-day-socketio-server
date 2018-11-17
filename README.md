# Giving Day with Socket.IO

For an overview of the project please read the blog: http://brifishjones.com/giving-day-socketio/


## Introduction
The giving-day-socket-io repository contains an Ubuntu virtual box that has both a secure Apache web server, and a secure node.js service running socket.IO. When a user browses to https://192.168.56.105 using Chrome, Opera, or Safari the socket.IO client connects to the socket.IO server and receives emitted updates every 15 seconds. It varies slightly from the production server in that it uses a self-signed certificate, and simulates the updating of pledges instead of using actual pledges from the content management system.

## Getting started

- download and install the virtual box app (https://www.virtualbox.org/wiki/Downloads)
- download and install Vagrant (https://www.vagrantup.com/downloads.html)
- clone or download the contents of this repository
- open a terminal application and `cd` into the giving-day-socketio-server directory
- type `vagrant up`
- point your browser to https://192.168.56.105 using Chrome, Opera, or Safari
- allow an exception when given the warning that the site does not have a certificate signed by a certificate authority

## Under the hood

`vagrant ssh` to access the virtual box and take a look at some of files such as:
- the socket.IO server log: `tail -n 100 /var/log/node.log`
- the ansible playbook (playbook.yml) that sets up and configures the server
- the contents of the files directory, in particular the socket server (files/server.js) and the socket client (files/index.html)
- note that files/server.js is copied to /etc/nodejs/giving-day/server.js when Ansible sets up the virtual box
- note that files/index.html is copied to /var/www/html/index.html when Ansible configures the virtual box
- if you want to modify either, make changes directly to /var/www/html/index.html or /etc/nodejs/giving-day/server.js
- bounce apache: `sudo service apache2 restart` or bounce socket.io: `sudo service giving-day-socket-server restart`
