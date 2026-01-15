---
title: ファクトリーメソッドを適用してFtpClientを設計する
date: 2023-07-07
categories: Development
author: kai98k
authorsWords: ネットワークプロトコルの多様化に伴い、新しいセキュリティプロトコルが登場するたびに、このプロトコルのために特別なクラスを書かなければならなくなり、クラスがどんどん増えていきます。インターフェースの仕様がないと、「私の中にあなたがいる、あなたの中に私がいる」という状態になりやすく、私があなたを使えず、あなたが私を使える（？）、つまり高結合、低凝集になりがちです。この時、ファクトリーメソッドを使用することで、単一のコンポーネントを再利用でき、Aを変更してもBに影響を与えないようにすることができます。
tags:
  - .Net
---

## ファクトリーメソッド

![Factory Method](https://hackmd.io/_uploads/B1-Otf8Vh.png)

ファクトリーメソッド（Factory Method）は一般的なデザインパターンであり、オブジェクト指向デザインパターンの一種に属します。オブジェクトを作成するためのインターフェースを提供しますが、具体的なオブジェクトの作成はサブクラスによって実装されます。ファクトリーメソッドパターンを使用すると、クラスはオブジェクトのインスタンス化をサブクラスに遅延させることができます。

ファクトリーメソッドパターンの主な目的は、オブジェクトの作成と使用を分離することです。これにより、既存のコードを変更することなく、新しいオブジェクトクラスを簡単に導入できます。オブジェクトを作成する柔軟な方法を提供し、必要に応じて実行時にインスタンス化する具体的なクラスを決定できます。

ファクトリーメソッドパターンでは、通常、オブジェクトを作成するためのインターフェースを定義するが具体的な実装を持たない抽象ファクトリークラスがあります。サブクラスは必要に応じてファクトリークラスを実装し、ファクトリーメソッドをオーバーライドして特定のオブジェクトを作成します。

#### C# コード例

ここでの例は上の図とは少し異なり、主にファクトリーが実装するためにインターフェースを継承する必要があるかどうかが異なります。基本的に、異なる製品には必ず規制するインターフェースがありますが、ファクトリーが 1 つしかない場合は、インターフェースが必要かどうかは状況によります。

1. まず、オブジェクトの共通操作メソッドを含む抽象インターフェース IProduct を定義します。

```csharp=
public interface IProduct
{
    void Operation();
}
```

2. 次に、具体的な製品クラス ConcreteProductA と ConcreteProductB を実装し、それぞれ IProduct インターフェースのメソッドを実装します。

```csharp=
public class ConcreteProductA : IProduct
{
    public void Operation()
    {
        Console.WriteLine("ConcreteProductA の操作");
    }
}

public class ConcreteProductB : IProduct
{
    public void Operation()
    {
        Console.WriteLine("ConcreteProductB の操作");
    }
}
```

3. 次に、オブジェクトを作成するための抽象メソッドを含む抽象ファクトリーインターフェース IFactory を定義します。

```csharp=
public interface IFactory
{
    IProduct CreateProduct();
}
```

4. そして、具体的なファクトリークラス ConcreteFactoryA と ConcreteFactoryB を実装し、それぞれ IFactory インターフェースのメソッドを実装します。

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

5. 最後に、ファクトリーメソッドパターンを使用してオブジェクトを作成します。

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

上記の例では、ConcreteFactoryA を使用して ConcreteProductA オブジェクトを作成し、ConcreteFactoryB を使用して ConcreteProductB オブジェクトを作成しています。このように、異なるファクトリークラスに応じて異なる製品オブジェクトを作成し、その操作メソッドを呼び出すことができます。

## FtpClient

次に、ファクトリーメソッドを適用して、異なる SFTP、FTP の FtpClient を生成します。ここでは FileInfo クラスの実装は省略しますが、通常の Ftp/Ftps は FluentFTP パッケージを参照し、SFTP は SSH.NET を参照しますが、最終的な Client の操作メソッドは同じになります。

1. まず、操作メソッドを規制する共通インターフェースを持つ IFtpClient を作成します。

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

2. インターフェースを継承する通常の FtpClient を作成し、メソッドを実装します（実装の詳細の大部分は省略）。

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
       /*...実装省略...*/
    }
```

3. インターフェースを継承する SftpClient を作成し、メソッドを実装します（実装の詳細の大部分は省略）。

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

4. Client を生成するファクトリーを作成します。

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

5. ファクトリーを使用します。

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

ファクトリーメソッドデザインパターンを使用すると、オブジェクトの柔軟な作成が可能になり、オブジェクトの作成と使用が分離され、コードの拡張と保守も容易になります。

## 参照

- [抽象ファクトリーパターン | Abstract Factory Pattern](https://ithelp.ithome.com.tw/articles/10239444)
