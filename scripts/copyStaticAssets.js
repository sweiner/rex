var shell = require('shelljs');
var static_docs = shell.find('.').filter(function(dir) { return dir.match('app/.*/static$'); });

for ( i = 0; i < static_docs.length; i++ )
{
    out_dir = static_docs[i].replace('app','out');
    shell.cp('-R', static_docs[i], out_dir);
}