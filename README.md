# globaljihoubot

ボットを招待する
https://discord.com/oauth2/authorize?client_id=1293583305794392084&permissions=2415930432&integration_type=0&scope=bot

## コマンド
/setschedule     時報を設定する  
/editschedule    時報を編集する  
/deleteschedule  時報を削除する  
/scheduleindex   時報を一覧表示する  
/omikuji         おみくじを引く

## 使い方
### /setschedule
時報する時刻とメッセージを設定します。  
オプション  
「time」※必須: 時報する時刻を設定します。HH:MMの形式で設定します。24や60より大きい値を設定しようとするとエラーが発生します。00:00から23:59の間で設定してください。  
「message」: 時報するメッセージを設定します。未設定の場合はデフォルトのメッセージを使用します。  
デフォルトのメッセージは「HH:MMをお知らせします」となります。  

### /editschedule
設定した時報の編集をします。  
オプション  
「id」※必須: 編集する時報のIDを指定します。IDは`/scheduleindex`で確認できます。  
「time」: 編集する時報の時刻を変更します。  
「message」: 編集する時報のメッセージを変更します。  
「channel」: 編集する時報のメッセージを送信するチャンネルを変更します。  
「isactive」: 編集する時報の有効/無効を切り替えます。  

コマンドを送信したサーバー以外の時報を編集することはできません。  

### /deleteschedule
設定した時報の削除をします。  
オプション 「id」※必須: 削除する時報のIDを指定します。IDは`/scheduleindex`で確認できます。  

### /scheduleindex
設定した時報の一覧を表示します。  
editscheduleとdeletescheduleで使用するIDはここで確認できます。  

### /omikuji
おみくじを引きます。  
結果はよい順に、
ぬべ吉 …1%  
大吉 …8%  
吉 …12%  
中吉 …16%  
小吉 …22%  
末吉 …22%  
凶 …12%  
大凶 …5%  
ヌベキチ└(՞ةڼ◔)」…2%  

ぬべ吉、またはヌベキチ└(՞ةڼ◔)」が出た場合は、ロールが付与されます。※botがサーバーに参加するとロールが作成されます。

おみくじは一日に一度しか引けません。また、毎朝5時にリセットされます。



