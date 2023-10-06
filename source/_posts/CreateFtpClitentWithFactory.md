---
title: 套用工廠方法設計 FtpClient
date: 2023-07-07 
categories: Dev Tech
author: kai98k
authorsWords: 隨著網路協定越來越多元，如果每多一種安全協定，就要為此協定，特別寫一個類別，而越來越多的類別，如果沒有介面規範，就很容易你中有我，我中有你，且無法讓我用你，你可以用我(?，也就是高耦合、低內聚，這時候就可以使用工廠方法，來重複使用單一元件，及不會改A動B。
tags:
- .Net
---

## 工廠方法

![工廠方法](https://hackmd.io/_uploads/B1-Otf8Vh.png)

工廠方法（Factory Method）是一種常見的設計模式，屬於物件導向設計模式的一種。它提供了一個創建物件的介面，但具體的物件的創建是由繼承類別來實現的。工廠方法模式允許一個類別將物件的創建延遲到子類別中進行。

工廠方法模式的主要目的是將物件的創建與使用解耦，這樣可以在不修改現有程式碼的情況下，輕鬆地引入新的物件類別。它提供了一種靈活的方式來建立物件，並且可以根據需要在運行時決定要實例化的具體類別。

在工廠方法模式中，通常會有一個抽象的工廠類別，該類別定義了一個創建物件的介面，但沒有具體實現。繼承類別將根據需要實現工廠類別，並覆寫工廠方法以創建具體的物件。

#### C# 程式碼範例

這邊範例會跟上圖有一點出入，主要是工廠有沒有需要繼承介面來實作，基本上，不同產品一定都會有介面來規範，但當工廠只有一個時，就看狀況有沒有需要介面。

1. 首先，定義抽象介面 IProduct，其中包含物件的共同操作方法：

```chsarp=
public interface IProduct
{
    void Operation();
}
```

2. 接下來，實作具體的產品類別 ConcreteProductA 和 ConcreteProductB，分別實現 IProduct 介面的方法：

```csharp=
public class ConcreteProductA : IProduct
{
    public void Operation()
    {
        Console.WriteLine("ConcreteProductA 的操作");
    }
}

public class ConcreteProductB : IProduct
{
    public void Operation()
    {
        Console.WriteLine("ConcreteProductB 的操作");
    }
}
```
3. 接下來，定義抽象工廠介面 IFactory，其中包含創建物件的抽象方法：

```csharp=
public interface IFactory
{
    IProduct CreateProduct();
}
```

4. 然後，實作具體的工廠類別 ConcreteFactoryA 和 ConcreteFactoryB，分別實現 IFactory 介面的方法：

```csharp=
public class ConcreteFactoryA : IFactory
{
    public IProduct CreateProduct()
    {
        return new ConcreteProductA();
    }
}

public class ConcreteFactoryB : IFactory
{
    public IProduct CreateProduct()
    {
        return new ConcreteProductB();
    }
}
```
5. 最後，使用工廠方法模式來創建物件：

```csharp=
public class Client
{
    public static void Main()
    {
        IFactory factoryA = new ConcreteFactoryA();
        IProduct productA = factoryA.CreateProduct();
        productA.Operation();

        IFactory factoryB = new ConcreteFactoryB();
        IProduct productB = factoryB.CreateProduct();
        productB.Operation();
    }
}
```

在上述示例中，使用 ConcreteFactoryA 來創建 ConcreteProductA 物件，並使用 ConcreteFactoryB 來創建 ConcreteProductB 物件。這樣，根據不同的工廠類別，可以創建不同的產品物件，並調用其操作方法。
 
## FtpClient

接下來，就要將工廠方法套用產生不同的SFTP、FTP的 FtpClient 上，這邊會省略 FileInfo 類別的實作，普通的 Ftp/Ftps 會引用 FluentFTP 套件，而 SFTP 則會引用 SSH.NET，但最後 Client 的操作方法都會相同。

1. 首先，創建 IFtpClient，有一共同介面來規範操作方法:
```csharp=
 public interface IFtpClient
    {
        IFtpClient SetHost(string host, int port, string userName, string password);

        bool AutoDisconnect { get; set; }

        bool IsConnected { get; }

        void Connect();

        Task ConnectAsync();

        void Disconnect();

        Task DisconnectAsync();

        IEnumerable<FileInfo> GetListing(string path);

        Task<IEnumerable<FileInfo>> GetListingAsync(string path);

        void Download(string localPath, string remotePath);

        Task DownloadAsync(string localPath, string remotePath);

        void DeleteFile(string path);

    }
```
2. 創建普通 FtpClient 繼承介面，並實作方法(會省略大部分實作細節)

```csharp=
 public class FtpClient : IFtpClient
    {
        private FluentFTP.IFtpClient _client;

        public FtpClient()
        {

        }

        public FtpClient(string host, string userName, string password)
        {
            _client = new FluentFTP.FtpClient(host, userName, password);
        }

        public FtpClient(string host, int port, string userName, string password)
        {
            _client = new FluentFTP.FtpClient(host, port, userName, password);
        }

        public IFtpClient SetHost(string host, int port, string userName, string password)
        {
            _client = new FluentFTP.FtpClient(host, port, userName, password);

            return this;
        }

        public bool AutoDisconnect { get; set; } = true;

        public bool IsConnected
        {
            get
            {
                if (_client == null)
                {
                    return false;
                }

                return _client.IsConnected;
            }
        }

        public void Connect()
        {
            if (_client.IsConnected) { return; }

            _client.AutoConnect();
        }
        public void Disconnect()
        {
            if (!_client.IsConnected) { return; }

            _client.Disconnect();
        }

        public async Task DeleteFileAsync(string path)
        {
            try
            {
                Connect();

                await _client.DeleteFileAsync(path);
            }
            finally
            {
                if (AutoDisconnect)
                {
                    Disconnect();
                }
            }
        }
        //.............
       /*...省略實作...*/
    }
```

3. 創建 SftpClient 繼承介面，並實作方法(會省略大部分實作細節):

```csharp=
public class SftpClient : IFtpClient
    {
        private Renci.SshNet.SftpClient _client;

        public SftpClient()
        {

        }

        public SftpClient(string host, int port, string userName, string password)
        {
            var kauth = new KeyboardInteractiveAuthenticationMethod(userName);
            var pauth = new PasswordAuthenticationMethod(userName, password);
            kauth.AuthenticationPrompt += new EventHandler<Renci.SshNet.Common.AuthenticationPromptEventArgs>(HandleKeyEvent);
            var connectionInfo = new ConnectionInfo(host, port, userName, pauth, kauth);

            _client = new Renci.SshNet.SftpClient(connectionInfo);

            void HandleKeyEvent(Object sender, Renci.SshNet.Common.AuthenticationPromptEventArgs e)
            {
                foreach (Renci.SshNet.Common.AuthenticationPrompt prompt in e.Prompts)
                {
                    if (prompt.Request.IndexOf("Password:", StringComparison.InvariantCultureIgnoreCase) != -1)
                    {
                        prompt.Response = password;
                    }
                }
            }
        }

        public bool AutoDisconnect { get; set; } = true;

        public bool IsConnected
        {
            get
            {
                if (_client == null)
                {
                    return false;
                }

                return _client.IsConnected;
            }
        }

        public void Connect()
        {
            if (_client.IsConnected) { return; }

            _client.Connect();
        }

        public void Download(string localPath, string remotePath)
        {
            try
            {
                Connect();

                if (File.Exists(localPath))
                {
                    File.Delete(localPath);
                }

                using (var fileStream = File.Create(localPath))
                {
                    _client.DownloadFile(remotePath, fileStream);
                }
            }
            finally
            {
                if (AutoDisconnect)
                {
                    Disconnect();
                }
            }
        }

        public void DeleteFile(string path)
        {
            try
            {
                Connect();

                _client.DeleteFile(path);
            }
            finally
            {
                if (AutoDisconnect)
                {
                    Disconnect();
                }
            }
        }
        
        /*...省略...*/
    }
```

4. 創建工廠產生 Client:

```csharp=
public class FtpFactory
    {

        public FtpFactory()
        {

        }
        /// <summary>
        /// use protocol to select the proper FtpClient
        /// </summary>
        /// <param name="host">IP Address</param>
        /// <param name="port"></param>
        /// <param name="userName"></param>
        /// <param name="password"></param>
        /// <param name="protocol"></param>
        public IFtpClient CreateClient(string host, int port, string userName, string password, FtpProtocols protocol = FtpProtocols.SFTP)
        {

            if (protocol == FtpProtocols.SFTP)
            {
                return new SftpClient(host, port, userName, password);
            }
            return new FtpClient(host, port, userName, password);
        }
    }
    public enum FtpProtocols
    {
        FTP = 0,
        FTPS = 1,
        SFTP = 2,
    }
```

5. 使用工廠:
```csharp=
  public FtpFactoryTest(IConfiguration configuration)
        {
            _configuration = configuration;
            var _ftpIP = _configuration.GetValue<string>("FTPInfo:IP");
            var _ftpUserName = _configuration.GetValue<string>("FTPInfo:UserName");
            var _ftpPassword = _configuration.GetValue<string>("FTPInfo:Password");
            var _Port = _configuration.GetValue<int>("FTPInfo:Port");
            var _Protocol = configuration.GetValue<FtpProtocols>("FTPInfo:Protocol");
            _ftpClient = new FtpFactory().CreateClient(_ftpIP, _Port, _ftpUserName, _ftpPassword, _Protocol);
            _fileLocation = _configuration.GetValue<string>("FileLocation");
        }
```

使用工廠方法設計模式可以實現物件的靈活創建，並將物件的創建與使用解耦，同時也便於擴展和維護程式碼。

## Reference
- [抽象工廠模式 | Abstract Factory Pattern](https://ithelp.ithome.com.tw/articles/10239444)