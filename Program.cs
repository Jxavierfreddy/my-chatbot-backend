using ALObjectParser.Library;
using System.Text.Json;

string query = args.FirstOrDefault(a => a.StartsWith("--query="))?.Split('=')[1] ?? "";
string path = args.FirstOrDefault(a => a.StartsWith("--path="))?.Split('=')[1] ?? "./al-files";

var objects = ALObjectReaderNew.ParseFolder(path);

var matches = objects
    .Where(o => o.Name?.Contains(query, StringComparison.OrdinalIgnoreCase) == true
             || o.Type?.Contains(query, StringComparison.OrdinalIgnoreCase) == true
             || o.Procedures.Any(p => p.Name?.Contains(query, StringComparison.OrdinalIgnoreCase) == true))
    .Select(o => new {
        o.Type,
        o.Name,
        Procedures = o.Procedures.Select(p => new {
            p.Name,
            p.Documentation
        })
    });

Console.Write(JsonSerializer.Serialize(matches));
