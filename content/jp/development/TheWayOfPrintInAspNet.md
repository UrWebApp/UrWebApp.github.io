---
title: .Net で印刷するいくつかの方法
date: 2023-02-05 15:00
categories: Development
author: kai98k
tags:
  - .Net
  - PDF
---

通常、プリンターは ZPL を送信するか、ドライバを介して直接印刷プロセスをトリガーできます。この記事では主に後者の印刷方法について説明します。

## ドライバのインストール

まずコンピュータにプリンターと通信ポートを認識させる必要があります。[BarTender](https://www.seagullscientific.com/tw/support/downloads/drivers/) にアクセスして、対応するドライバをインストールできます。

1. ダウンロード後に接続方法を選択します

![ステップ1](https://i.imgur.com/IjBDcBJ.png)

2. プリンターモデルを指定します

![ステップ2](https://i.imgur.com/u5o7UKI.png)

3. プリンターがネットワーク経由で接続されていると仮定すると、設定で IP ポートを追加する必要があります

![ステップ3](https://i.imgur.com/cSunWhn.png)
![ステップ3-2](https://i.imgur.com/6upmKAf.png)
![ステップ3-3](https://i.imgur.com/aaC4fTz.png)

## プログラム実装

### PrintDocument と Process

PrintDocument クラスは .Net Framework の組み込みパッケージです。利点は、プリンターに送信されるオブジェクトの出力の設定と操作ができることで、Process と組み合わせてコマンドを使用して印刷できます。

> 注意：プロジェクトが Windows 以外の環境にデプロイされている場合は機能しません。基本的には .Net Framework プロジェクトでのみ使用するのが最適です。

#### コマンドを使用した印刷

ここで `Print` Verb を使用する場合、まず Regedit に移動して、コンピュータにこのコマンドが登録されているかどうかを確認する必要があります。

![ステップ1](https://i.imgur.com/DdhyIbi.png)

![ステップ2](https://i.imgur.com/Z5X7uF7.png)

ない場合は、通常 [Acrobat Reader](https://get.adobe.com/tw/reader/) がインストールされていません。この PDF 閲覧ソフトウェアは、コンピュータに印刷コマンドを自動的に登録します。このコマンドがあれば、コードを実装できます。

```csharp
private void Print(string pdfPath)
{
   PrintDocument pd = new PrintDocument();

   pd.DefaultPageSettings.PrinterSettings.Copies = 2; // アイコン
   pd.DefaultPageSettings.PrinterSettings.PrinterName = @"プリンター名";

    // コマンドの追加
   Process ps = new Process();
   ProcessStartInfo startInfo = new ProcessStartInfo();
   startInfo.UseShellExecute = true;
   startInfo.Verb = "Print";
   startInfo.CreateNoWindow = true;
   startInfo.WindowStyle = ProcessWindowStyle.Hidden;
   startInfo.Arguments = @"/p /h \" + pdfPath + "\" \"" + pd.PrinterSettings.PrinterName + " \"";

   startInfo.FileName = pdfPath;
   ps.StartInfo = startInfo;

   ps.Start(); // コマンドの実行
   ps.WaitForExit();
   ps.Dispose();

}
```

---

#### 純粋な PrintDocument

```csharp=
using System;
using System.Drawing;
using System.Drawing.Printing;
using System.Windows.Forms;

namespace PrintTest
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            streamToPrint = new StreamReader
               (@"C:\\My Documents\\MyFile.txt");

            //印刷オブジェクトインスタンスの作成
            PrintDocument printDocument = new PrintDocument();
            // プリンターの選択
            printDocument.DefaultPageSettings.PrinterSettings.PrinterName = @"プリンター名";
            //印刷用紙の設定、用紙サイズの定義が可能
            printDocument.DefaultPageSettings.PaperSize = new PaperSize("Custom", 500, 500);
            //PrintPage イベントの登録、各ページの印刷時にトリガーされます
            printDocument.PrintPage += new PrintPageEventHandler(this.PrintDocument_PrintPage);
            // 印刷開始
            printDocument.Print();
            streamToPrint.Close();
        }
        private void PrintDocument_PrintPage(object sender, System.Drawing.Printing.PrintPageEventArgs e)
        {
            //印刷内容とそのフォント、色、位置の設定
            e.Graphics.DrawString("Hello World！", new Font(new FontFamily("Arial"), 24), System.Drawing.Brushes.Red, 50, 50);

            // 各行を印刷
              while (count < linesPerPage &&
           ((line = streamToPrint.ReadLine()) != null))
        {
            yPos = topMargin + (count *
               printFont.GetHeight(e.Graphics));
            e.Graphics.DrawString(line, printFont, Brushes.Black,
               leftMargin, yPos, new StringFormat());
            count++;
        }
        }
    }
}
```

### FreeSpire.Pdf

<https://www.gushiciku.cn/pl/2N0Y/zh-tw>
FreeSpire.Pdf は Nuget またはコマンドを使用してインストールする必要があります

> 無料のコミュニティバージョンは、10 ページを超えて印刷するとエラーを報告します。9 ページごとに印刷するように書くことができるかもしれません...

1. デフォルトのプリンターを使用してすべてのページを印刷する

```csharp=
PdfDocument pd = new PdfDocument();
pd.LoadFromFile(@"C:\File\testPdf.pdf")
pd.Print();
```

2. プリンターを指定し、ドキュメントの印刷範囲を設定する

```csharp=
PdfDocument pd = new PdfDocument();
pd.LoadFromFile(@"C:\File\testPdf.pdf")
// プリンターの指定
pd.PrintSettings.PrinterName = "プリンター名";
// 印刷ページ範囲の設定、2〜6ページ
pd.PrintSettings.SelectPageRange(2,6);
// or 不連続なページの印刷設定
pd.PrintSettings.SelectSomePages(new int[]{2,4,6,8});
pd.Print();
```

3. 白黒両面複数部数印刷

```csharp=
PdfDocument pd = new PdfDocument();
pd.LoadFromFile(@"C:\File\testPdf.pdf")
// 白黒印刷
pd.PrintSettings.Color = false;
// 複数部数を設定
pd.PrintSettings.Copies = 3;
//プリンターが両面印刷をサポートしているかどうかを判断
if (pd.PrintSettings.CanDuplex)
{
     //サポートされている場合は両面印刷モードを設定、オプション：Default/Simplex/Horizontal/Vertical
     pd.PrintSettings.Duplex = Duplex . Default ;
}
pd.Print();
```

### PdfiumViewer

[公式ドキュメント](https://github.com/pvginkel/PdfiumBuild)を参考にインストールできます。パッケージの作者がメンテナンスしていないため、Nuget で PdfiumViewer をインストールする以外に、pdfiumViewer.Native.x86_64.v8-xfa もインストールする必要があります。ここでは 2.10.0 の PdfiumViewer のインストールをお勧めします。インストール後、プロジェクトに x64 フォルダが表示されます。

![PdfiumViewer](https://i.imgur.com/aMo9UrL.png)

```csharp=
var pdfPath = @"データの場所"
try
            {
                using (var document = PdfDocument.Load(pdfPath))
                {
                    using (var printDocument = document.CreatePrintDocument())
                    {
                        printDocument.PrinterSettings.PrintFileName = "testPdf.pdf";
                        printDocument.PrinterSettings.PrinterName = @"プリンター名";
                        printDocument.DocumentName = "file.pdf";
                        printDocument.PrinterSettings.PrintFileName = "file.pdf";
                        printDocument.PrintController = new StandardPrintController();
                        printDocument.Print();
                    }
                }
                return "success";
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
```

## Reference

- [PrintDocument](https://learn.microsoft.com/zh-tw/dotnet/api/system.drawing.printing.printdocument?view=dotnet-plat-ext-7.0)
- [7 Ways to Print PDF in a .NET Application](https://medium.com/@alexaae9/7-ways-to-print-pdf-in-a-net-application-ab15905bb98f)
- [デフォルトのプリンターを使用して pdf ファイルを印刷する](https://dotblogs.com.tw/whd/2016/03/22/234526)
- [C# を使用して PDF ファイルをバッチ印刷する](https://blog.darkthread.net/blog/print-pdf-with-c)
- [C# で PDF ファイルを印刷する 10 の方法](https://www.gushiciku.cn/pl/2N0Y/zh-tw)
- [C# - How to programmatically print an existing PDF file using PrintDocument](https://stackoverflow.com/questions/47857500/c-sharp-how-to-programmatically-print-an-existing-pdf-file-using-printdocument)
