# <center>竞猜类小程序防作弊处理</center>
1. 做用户参与游戏前必须在服务器端生成结果，并同时生成一对公私钥和当时的时间戳
> 例如: Dice时，
- 当用户进行页面时，后面服务器会生成GameId=1, Server端的结果=3(3点), key1, key2, Timestamp.
- 公布PubKey, Timestamp, 

raw: time:21213231231231,results:[3]  
用key1对raw进行AES加密得EncodeData1  
再用key2对EncodeData1进行AES加密得EncodeData2  
公布key2和EncodeData2, 当游戏结束后再公布key1  
用户可以通过key1, key2反向验证是否作弊  

假设 猜大小小程序
在用户进行小程序时，服务器端就生成了“大”这个结果，并用 key1, key2对 “time:[当前时间],result:[1]"进行两次加密得到EncodeData, 把EncodeData和key2发放给用户  
如果用户猜“大”， 在公布结果时，把key1也公布出来，用户可以通过key1, key2进行解密, 得出之前服务器设定的结果以判断是否作弊  

假设小程序作弊，故意把结果从“大”改成“小”， 小程序很难做到通过不改动key2和EncodeData的情况下，更改key1而改动预先设置的结果

## 注: 所有竞猜类小程序, 必须先预定结果, 公布预定结果的约定, 以达到公平性
- BlackJack：要预先生成牌的顺序
- 剪刀石头布：要预先生成结果
- Dice：要预先生成结果
- 牛熊大战: 不需要
- 合成大西瓜: 不需要

