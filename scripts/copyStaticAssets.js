var shell = require('shelljs');
var path = require('path');

var static_docs = shell.find('.').filter(function(dir) { return dir.match('app/.*/static$'); });

for ( i = 0; i < static_docs.length; i++ )
{
    const static_path = path.normalize(static_docs[i]);
    
    var out_path = static_path;
    out_path = out_path.replace('app','out')
    out_path = out_path.replace('\\static','');
    
    shell.cp('-Rf', static_path, out_path);
}