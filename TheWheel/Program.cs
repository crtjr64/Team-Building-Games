using System.Configuration;
using TheWheel.Models;
using TheWheel.Models.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddSingleton<HttpClientWorksForGraph>();
builder.Services.AddSignalR();


//Would like to set up a service here for retreiving player data to be able to change from test to actual data


var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

//app.Services.GetService<HttpClientWorksForGraph>();

//per Azure webpubsub instructions
//app.UseEndpoints(endpoints =>
//{
//});
//per Azure webpubsub instructions


app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

//app.MapControllerRoute(name: "config",
//    pattern: "{controller=Home}/{action=Config}");

app.MapControllerRoute(name: "logon",
    pattern: "{controller=Home}/{action=Logon}");

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.MapHub<WofChatHub>("/wofChatHub");

app.Run();
