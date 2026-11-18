using System;
using Newtonsoft.Json;
using System.Collections.Generic;

public class Test {
    public static void Main() {
        var authHeader = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhbGwiLCJpc3MiOiJ2YXBzIiwibmJmIjoxNzI0OTIzMjA2LCJleHAiOjE3MjUwMDk2MDYsImlhdCI6MTcyNDkyMzIwNiwiTUlfSWQiOjIsInVzZXJJZCI6Miwicm9sZUlkIjoyLCJtaV9pZCI6MiwidXNlcl9pZCI6Mn0.xxxx";
        var jwtToken = authHeader.Substring("Bearer ".Length).Trim();
        var parts = jwtToken.Split('.');
        var payload = parts[1];
        payload = payload.Replace('-', '+').Replace('_', '/');
        switch (payload.Length % 4)
        {
            case 2: payload += "=="; break;
            case 3: payload += ="; break;
        }
        var jsonBytes = System.Convert.FromBase64String(payload);
        var jsonStr = System.Text.Encoding.UTF8.GetString(jsonBytes);
        var dict = JsonConvert.DeserializeObject<Dictionary<string, object>>(jsonStr);
        Console.WriteLine("mi_id: " + dict["mi_id"]);
    }
}
