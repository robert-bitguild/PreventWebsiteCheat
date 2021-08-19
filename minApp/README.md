# <center>Min App 设计</center>

## Client API

It best serve the user who want promote their game or advertizement in group. Guild chat provider the entrance to bind chat group. For the entrance, the end user can click it to open the url in webview which integrate in Guild chat. The group administrator can do a lot of things like Game, Advertizement etc.

Guild chat provide serveral API for your client. All of these api can be invoke by window.gcInstance instance

### 1. getUserInfo():

    > Output

```js
     Promise<{userId: string; name: string; avatar: string; sessionId?: string, token:string}>
```

    > Desc: 获取当前的登录用户
    > token
    返回的token字段是用该minApp的公钥对{time:number;name:string;userId:string}进行加密, time是第一次进入的时间，所以这个可以用作MinApp Client和MinApp Server身份之间的身份验证, MinAppServer可以对token进行解密并对time进行验证(理论上上,time不应该超过1天)

### 2. startPay(tokenId:string | null, quantity: number, param: string)

    要求用户发起向小程序进行支付
    > tokenId
    支付的币种，该Id可以在管理者后端取到，一般格式为"trx_1","eth_3"
    > quantity
    支付的币的数量
    > param
    付款相关的参数，当付款成功后，该字段会传给小程序的后端，同时在小程序后端调用getTransaction或getTransactions取到该字段，一般情况，你可以把你的订单Id及相关信息存在该字段，当付款成功回调后端时，你可以取回该字段，在小程序后端设置订单的状态

    Output: Promise<{ transactionId: string; signature: string; signTime: number; }>
    null: 表示取消付款
    Error:  
    - code: 190000, msg: Coinpouch password didn't set
    - code: 190001, msg: The coin didn't support
    - code: 190002, msg: Single payment don't allow exceed xxx
    - code: 190003, msg: Single payment must biger than xxx
    - code: 600001, msg: MinApp did not exist
    - code: 600008, msg: MinApp did not support the coin
    - code: 600009, msg: MinApp single quantity error
### 3. closeWindow

    关闭当前的Game窗口
    > Desc: Close current window, back to chat room

### 4. shareTo(msg: MinAppMessage)

    发送消息到聊天室内

```typescript
interface MinAppMessage {
    text: string | null;
    imageUrl: string;
    width: number;
    height: number;
    linkUrl: string | null;
}
shareTo(msg: MinAppMessage)
```

### 5. onShare: () => { text: string | null, linkUrl: string | null}
    小程序端可以override该方法, 如果返回的是null值，则使用当前网页的title和url
```typescript
    // 当点击分享时，提供自己的分享内存
    window.gcInstance.onShare = () => {
        return {
            text: '分享我的内存',
            linkUrl: 'http://www.baidu.com'
        }
    }
```
### 6. signData(minAppId, signContent): Promise<{signature:string; signTime:number}>

    通过后台对内容进行签名，可以确定该内容是由GuildChat发送的，而不是由外部黑客进行模访发送的数据
    > Desc
    sign data via backend. it can make sure the content signed by GuildChat. In order to prevent mock from hack. the sign content will add prefix "I_[SignTime]_", signTime wil be return from the interface

### 7. setMinAppStatus({minAppId, roundId, status, disableNavigateToWebview, toastMessage})

    设置一盘Game的状态，可以让玩家看到该局Game在状态，如该Game未完，已完状态
    > minAppId: Your min app id (can be null)
    roundId: The game id or activity id
    status: 0--normal, 1---the chat message will overlap a mask
    disableNavigateToWebview: does allow use to click the message to navigate to webview
    toastMessage: if disableNavigateToWebview is true, does show toast to user if user clicked the chat message

### 8. getSafeAreaInset() 
    获取Safe Area的安全区域  
    - 返回Promise<number[]>, number的数组: [left,top,right,bottom]四个元素
```typescript
    const inset = await MinAppSDK.getSafeAreaInset();
    const left = inset[0];
    const top = inset[1];
    const right = inset[2];
    const bottom = inset[3];
``` 
### 9. setStatusBarStyle(isLight:boolean)
    设置手机的statusbar为亮色还是暗色
### 10. applySafeArea
    设置Webview是否放到SafeArea区域以及背景的Color
```typescript
    enum SafeAreaTopType {
        None = 0,
        UnderStatusBar = 1,
        UnderSystemMenu = 2,
    }

    interface SafeAreaParam {
        // 0: 为置顶, 1: 为放到statusbar下（安全区域），2，放到(更多和关闭按键下)
        top?: SafeAreaTopType | null;
        // false, 为不应用SafeArea, true为应用
        left?: boolean | null;
        // false, 为不应用SafeArea, true为应用
        right?: boolean | null;
        // false, 为不应用SafeArea, true为应用
        bottom?: boolean | null;
        // 背景Color, 如果top设置成2, 如果不设置该字段，则为系统default的color
        bkColor?: string | null;
    }
    MinAppSDK.getSafeAreaInset({top: 2, bkColor:"#fff"});
```
### 11. setSystemBackGuestureControlByApp
    这个是指设置是否由小程序自己来控制左滑来关闭小程序
```typescript
    const isControlByApp = true;
    MinAppSDK.setSystemBackGuestureControlByApp(isControlByApp);
```      
### 12. setBackGesturesEnabled
    设置是否响应左左滑来关闭小程序
```typescript
    MinAppSDK.setBackGesturesEnabled(true);
```  
        

## Server API

Except client API, Guild chat provider serveral server API. the Game provider or Team administrator can use those API to enhance and promote their production

### 1. /api/sdk/payCoinToUser

    POST JSON: {transactionId,minAppId,payType,toUserId,chainType,coinId,amount,desc,otherParam,signature,timestamp}
    - payType should be one of 'MinAppRefund' | 'MinAppReward' | null, 传null默认为'MinAppReward'
    - signatur
```typescript
   // 使用你的secret key(也就是私钥对参数进行签名)，来保证安全
   const signContent = transactionId
      + this.minAppId
      + payType
      + toUserId
      + chainType
      + coinId
      + quantity
      + desc
      + otherParam
      + timestamp;
    const signature = rsaSign(signContent, this.privateKey);

    export const rsaSign = (content: string, privateKey: string): string => {
        const crypto = require("crypto");
        const signer = crypto.createSign('SHA256');
        signer.update(content);
        signer.end();
        const signature = signer.sign(privateKey, 'base64');
        return signature;
    };
```

### 2. /api/sdk/transaction?transactionId=&minAppId=&timestamp=&signature=
- timestamp: 不能与当前服务器时间差1天，否则认为是伪造数据攻击
```typescript
    const timestamp = new Date().getTime();
    const signContent = transactionId + this.minAppId + timestamp;
    const signature = rsaSign(signContent, this.privateKey);
```

### 3. /api/sdk/transactions?minAppId=&startCreatedTime=&endCreatedTime=&pageIndex=&countPerPage=&signature=&timestamp=
- timestamp: 不能与当前服务器时间差1天，否则认为是伪造数据攻击

# We have add more graphql API to support min app internal as below

- payCoinToMinApp

```typescript
@mutate
payCoinToMinApp(toMinAppId:string,chainType:string,coinId:number,quantity: number,desc: string, param: string, password: string):
{
    // 交易的Id
    transactionId: string;
    // 签名的时间
    signTime: number;
    // 用服务器的私钥对以下内部进行签名“T_[curUserId]_[minAppId]_[signTime]_[transactionId]”, 用于验证该交易是否为真实交易
    signature: string;
}
```

- getMinApp

```typescript
@query
getMinApp(minAppId: string): {
    minApp: {
        minAppId: string;
        minAppName: string;
        description: string | null;
        avatar: string | null;
        // 入口的url地址
        entryUrl: string | null;
        isFavorite: boolean;
        // 这是用户的token, 与用该相关，用于验证是否由Guildchat发布的token, 他何用用户的公钥对以下内容进行加密，只有用户用自己的私钥才能进行解密
        // { userId: user.uid, time: tokenPublishTime,name: user.username };
        userToken: string;
        // token的发布时间，用户可以根据用户的发布时间来决定该token是否有效
        tokenPublishTime: number;
        banner: string | null;
        bannerWidth: number | null;
        bannerHeight: number | null;
        supportCoins: [{
            chainType: string;
            coinId: number;
            symbol: string;
            maxSingleQuantity: number | null;
            minSingleQuantity: number | null;
        }]
    }
}
```

- getMinApps

```typescript
@query
getMinApps(searchContent: string, pageIndex: number, countPerPage: number): {
    minApps: [{
        minAppId: string;
        minAppName: string;
        description: string | null;
        avatar: string | null;
        // 入口的url地址
        entryUrl: string | null;
    }]
}
```

- getSessionMinApps

```typescript
@query
getSessionMinApps(sessionId: string): {
    minApps: [{
        minAppId: string;
        minAppName: string;
        description: string | null;
        avatar: string | null;
        // 入口的url地址
        entryUrl: string | null;
    }]
}
```

- addMinAppToSession

```typescript
@mutate
addMinAppToSession(sessionId: string, minAppId: string): {
    code: string;
    message: string;
}
```

- removeMinAppFromSession

```typescript
@mutate
removeMinAppFromSession(sessionId: string, minAppId: string): {
    code: string;
    message: string;
}
```

- signDataInMinApp

```typescript
@mutate
signDataInMinApp(minAppId: string, signContent: string): {
    code: string;
    message: string;
    // 用服务器的私钥对以下内部进行签名“I_[curUserId]_[minAppId]_[signTime]_[signContent]”, 用于验证该交易是否为真实交易
    signResult: {
        // 签名后的结果
        signature: string;
        // 签名的时间，这个会放到签名内容中
        signTime: number;
    }
}
```

- getMyFavoriteMinApp:

```typescript
@query
getFavoriteMinApps(): {
    code: string;
    message: string;
    minApps: [{
        minAppId: string;
        minAppName: string;
        description: string | null;
        avatar: string | null;
        // 入口的url地址
        entryUrl: string | null;
    }]
}
```

- addMinAppToFavorite

```typescript
@mutate
addMinAppToFavorite(minAppId: string): {
    code: string;
    message: string;
}
```

- removeMinAppFromFavorite

```typescript
@mutate
removeMinAppFromFavorite(minAppId: string): {
    code: string;
    message: string;
}
```
- setUserSetting

```typescript
@mutate
setUserSetting(key: string, value: string): {
    code: string;
    message: string;
}
```

> 这是用户设置(通用),App 可以进行以下调用(注，以下为伪代码)

```typescript
const agreedMinAppClaim = setUserSetting(UserSetting.AgreedMinAppClaim, "1");
// ...
```
- getUserSetting

```typescript
@query
getUserSetting(key: string): {
    code: string;
    message: string;
    value: string | null;
}
```

> 这是用户设置(通用),App 可以进行以下调用(注，以下为伪代码)

```typescript
const agreedMinAppClaimSetting = getUserSetting(UserSetting.AgreedMinAppClaim);
const agreedMinAppClaim = agreedMinAppClaimSetting.value === "1"
// ...
```

