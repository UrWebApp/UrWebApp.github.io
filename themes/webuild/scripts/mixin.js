
  hexo.extend.helper.register('cnToEncode', (path)=>{
    let patternCn=new RegExp("[\u4E00-\u9FA5]+"); if(patternCn.test(path)){ let temp=[];
      path.split('/').forEach(element=> {
      temp.push(encodeURIComponent(element));
      });
      // sample /後端開發/NET6 使用 Serilog，在 Log 當下同時寄信/
      path = `/${temp[1]}/${temp[2]}/`;
      }
      return path;
  });
