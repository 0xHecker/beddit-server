echo What should the version be?
read VERSION

docker build -t shanmukh3/beddit:$VERSION .
docker push shanmukh3/beddit:$VERSION
ssh root@143.110.190.109 "docker pull shanmukh3/beddit:$VERSION && docker tag shanmukh3/beddit:$VERSION dokku/api:$VERSION && dokku deploy api $VERSION"
