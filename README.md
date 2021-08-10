# <center>Prevent cheat from website for guess min app</center>

The article is design an approach to prevent website cheat in guess min app.

As you know, the guess game developed by website is easy to cheat to player. For example, if you play dice game, the website easy to control your result(win or lost) with no justice. To keep player's interest, the article describle how to prevent website to cheat.  

## Arithmetic
Game provider generate two keys and result before player to play game.  the key whould be current timestamp plus uuid. player is easy to identifier the timestamp. Game provider encode the result with two key by AES encrypt method.  

Result---[AES(key1)]--->EncodeResult1---[AES(key2)]--->EncodeResult2  

Game provider publish key1 and EncodeResult2 to player before play game. After player played game, the game player publish the key2 to verify does the result is match what the provider generated before.

The reason is the website can NOT to change EncodeResult2 to archive change Result.

## Example
We play rock-paper-scissors game.
## Before play
Game provider generate a result and two keys as below:  
result: "2,1,3,3,3,1,3,2,3,3"(1: rock, 2: scissors, 3: paper)  
key1: 1628565316383_62aa9ad1-c61a-4e2c-88c3-c4ca27974610  
key2: 1628565316383_5694667a-38bd-4e7e-92a1-7b34deac4c55   
The EncodeResult2 should be:  
U2FsdGVkX19xIpptk2sgSDcq78KVQnYA7HX1mBmgQWOsiZ+snrCmXlOD8bDrrROFMph65iORHq+wI6ic/akglGpSo4xZoRsSqLGrwwk18zrKeexl68IvvCFYji+BeDMi

In this time, player should be see key1 and EncodeResult2 in somewhere. like  
![](./gameKey1AndResult.png)

## After played

For the scenaro, if you choosed scissors. The game provider can NOT change the result to let you lose the game. because the result alreay given["2,1,3,3,3,1,3,2,3,3"(1: rock, 2: scissors, 3: paper), The first number will match if you play one round with one click].  

However, Once the player have played game. The player should be easy get key2 in somewhere to verify does the result. like  
![](./gameKey1AndKey2.png)

In this time, the player have two keys and EncodeResult. Play can use the three fields to decode EncodeResult.

![](./gameVerify.png)

## Finally
The key point is the game player can't change key2 to change result. If you have other arguement, please tell me. 