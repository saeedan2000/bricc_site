# bricc_site
This repository contains the code for the BRICC website. The plan is to set up a code pipeline from here to the elastic
beanstalk application hosting the site, allowing for easy deployment of updates.
The site can be found at the following url:

http://briccwebapp-env.eba-ekqffpav.us-east-1.elasticbeanstalk.com/

You can connect to the database with the following command (assuming you have an inbound rule in the security group, and mysql installed):

```mysql -h  aa1xgsg8qe5aw2y.cjuyqly3o6ur.us-east-1.rds.amazonaws.com -P 3306 -u briccdb -p ebdb```
