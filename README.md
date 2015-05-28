# An assignments app to help with grading front-end development assignments

[Screencast of the app in use](https://vimeo.com/123043554)


## Setup instructions

1. Set up a new server. I recommend ubuntu on AWS or Digital Ocean
2. ssh into the server and become root
	* sudo su
3. Set a hostname
	* echo "assignments.nutellahabit.com" > /etc/hostname
4. Update and upgrade
	* apt-get update
	* apt-get upgrade
5. Install the necessary packages
	* apt-get install nginx postgresql postgresql-contrib sysstat ntp ntpdate git htop rcconf rkhunter rng-tools gnutls-bin mcrypt openssl-blacklist debhelper
6. Prevent the www-data user from loggin in or using the shell
	* passwd -l www-data
	* usermod -s /bin/false www-data
7. Add a user for yourself
	* adduser alarner
8. Set your new users timezone
	* echo "TZ='America/Chicago'; export TZ" >> /home/alarner/.profile
9. Give yourself sudo priveledges
	* `visudo` (use the same settings as root but for your new user)
10. Set up ssh keys
	* mkdir /home/alarner/.ssh
	* touch /home/alarner/.ssh/authorized_keys2
	* chown -R alarner:alarner /home/alarner/.ssh
	* chmod -R 700 /home/alarner/.ssh
	* chmod 600 /home/alarner/.ssh/authorized_keys2
	* *Add the public key of your computer to /home/alarner/.ssh/authorized_keys2*
	* su alarner
	* ssh-keygen -t rsa -C "hi@900dpi.com"
	* exit
11. Disable root login and X11 Forwarding
	* sed -i 's/X11Forwarding yes/X11Forwarding no/' /etc/ssh/sshd_config
	* sed -i 's/PermitRootLogin .*$/PermitRootLogin no/' /etc/ssh/sshd_config
	* /etc/init.d/ssh restart
12. Set up IPTABLES
	* iptables -F
	* iptables -A INPUT -i eth0 -p tcp --dport 22 -m state --state NEW -m recent --set --name SSH
	* iptables -A INPUT -i eth0 -p tcp --dport 22 -m state --state NEW -m recent --update --seconds 60 --hitcount 8 --rttl --name SSH -j DROP
	* iptables -A INPUT -m state --state RELATED,ESTABLISHED -j ACCEPT
	* iptables -A OUTPUT -m state --state NEW,RELATED,ESTABLISHED -j ACCEPT
	* iptables -A INPUT -p tcp -m tcp --dport 22 -j ACCEPT
	* iptables -A INPUT -p tcp -m tcp --dport 80 -j ACCEPT
	* iptables -A INPUT -p tcp -m tcp --dport 443 -j ACCEPT
	* iptables -A INPUT -s 127.0.0.1 -j ACCEPT
	* iptables -A INPUT -j LOG
	* iptables -N port-scan
	* iptables -A port-scan -p tcp --tcp-flags SYN,ACK,FIN,RST RST -m limit --limit 1/s -j RETURN
	* iptables -A port-scan -j DROP
	* iptables -A OUTPUT -p tcp -m tcp --dport 22 -j DROP
	* iptables -A INPUT -j DROP
	* iptables -A FORWARD -j DROP
	* iptables -A FORWARD -j LOG
	* iptables-save > /root/firewall
	* echo -e '#!/bin/sh\niptables-restore < /root/firewall' > /etc/network/if-up.d/iptables
	* chmod 755 /etc/network/if-up.d/iptables
13. Set up proper timezone
	* dpkg-reconfigure tzdata
14. Install nodejs (this might take a while)
	* apt-get install python g++ make
	* mkdir ~/nodejs && cd $_
	* wget -N http://nodejs.org/dist/node-latest.tar.gz
	* tar xzvf node-latest.tar.gz && cd \`ls -rd node-v*\`
	* ./configure
	* make install
15. Install redis
	* wget http://download.redis.io/redis-stable.tar.gz
	* tar xvzf redis-stable.tar.gz
	* cd redis-stable
	* make
	* make install
	* cd utils
	* sudo ./install_server.sh
16. Reboot the server and re-log in with the user you created in steps 7-10
	* reboot
17. Install global npm packages
	* sudo npm install -g sails forever bower gulp grunt-cli
18. Install sass
	* sudo gem install sass
19. Create postgres user and database
	* sudo -u postgres -i
	* createdb appdb
	* psql
	* ALTER USER postgres PASSWORD 'postgres';
	* \q
	* exit
20. Create database schema:

	```
	```

20. Clone assignments repo from GitHub
	* sudo mkdir -p /usr/share/nginx/www
	* sudo chown -R alarner:alarner /usr/share/nginx/www
	* cd /usr/share/nginx/www
	* git clone https://github.com/alarner/code-school-assignments-app.git
	* mv code-school-assignments-app assignments.nutellahabit.com
	* cd assignments.nutellahabit.com
	* npm install
	* bower install
	* gulp build
21. Create an [AWS account](http://aws.amazon.com/) and S3 credentials as well as an s3 bucket
22. Create a [GitHub app](https://github.com/settings/developers) for authentication
23. Create a file `/usr/share/nginx/www/assignments.nutellahabit.com/config/local.js` and replace with the GitHub and S3 credentials that you created.

	```js
	module.exports = {
		environment: process.env.NODE_ENV || 'production',
		connections: {
			postgres: {
				adapter: 'sails-postgresql',
				host: 'localhost',
				user: 'postgres',
				password: 'postgres',
				database: 'appdb'
			}
		},
		aws: {
			accessKeyId: 'AWS_ACCESS_KEY',
			secretAccessKey: 'AWS_SECRET_ACCESS_KEY',
			s3: {
				region: 'BUCKET_REGION',
				bucket: 'BUCKET_NAME'
			}
		},
		passport: {
			github: {
				options: {
					clientID: 'GITHUB_CLIENT_ID',
					clientSecret: 'GITHUB_CLIENT_SECRET',
					callbackURL: 'APP_DOMAIN/auth/github/callback'
				}
			}
		}
	}
	```

24. Set up nginx
	* sudo mkdir -p /var/log/nginx/assignments.nutellahabit.com
	* sudo mkdir -p /var/log/nginx/s.assignments.nutellahabit.com
	* sudo mkdir -p /var/log/nginx/queue.assignments.nutellahabit.com
	* sudo cp nginx /etc/nginx/sites-available/assignments.nutellahabit.com.conf
	* sudo rm /etc/nginx/sites-enabled/default
	* sudo ln -s /etc/nginx/sites-available/assignments.nutellahabit.com.conf /etc/nginx/sites-enabled/assignments.nutellahabit.com.conf
	* sudo service nginx restart
25. Set up init script
	* sudo cp /usr/share/nginx/www/assignments.nutellahabit.com/init /etc/init.d/assignments.nutellahabit.com
	* mkdir -p /home/ubuntu/assignments.nutellahabit.com
	* sudo chmod a+x /etc/init.d/assignments.nutellahabit.com
	* sudo update-rc.d assignments.nutellahabit.com defaults
26. Start the server
	* sudo service assignments.nutellahabit.com start