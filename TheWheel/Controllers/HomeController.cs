using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using TheWheel.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;


namespace TheWheel.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly HttpClientWorksForGraph _graphclient;

        public HomeController(ILogger<HomeController> logger, HttpClientWorksForGraph graphclient)
        {
            _logger = logger;
            _graphclient = graphclient;
        }

        [Route("")]
        [Route("Home")]
        [Route("Home/Index")]
        [Route("Home/Index/{id?}")]
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [Route("Logon")]
        public IActionResult Logon(string tenantid, string redirecturi, string clientid)
        {
            return Redirect($"https://login.microsoftonline.com/{tenantid}/oauth2/v2.0/authorize?client_id={clientid}&response_type=code&scope=User.Read&redirect_uri={redirecturi}");
        }

        [Route("Config")]
        [Route("Home/Config")]
        public IActionResult Config() 
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        [HttpGet]
        public ContentResult GetPlayers()
        {
            LoadGamePlay load = new LoadGamePlay();

            return new ContentResult()
            {
                Content = JsonConvert.SerializeObject(load.GetPlayers(), new JsonSerializerSettings
                {
                    ContractResolver = new Newtonsoft.Json.Serialization.CamelCasePropertyNamesContractResolver()
                }),
                ContentType = "application/json"
            };
        }
    }
}