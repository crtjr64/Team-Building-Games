namespace TheWheel.Models
{
    public class PlayerTeams
    {

        public PlayerTeams()
        {
            Id = "";
            Name = "";
            Points = 0;
            Players = new List<Player>();

        }
        public string Id { get; set; }
        public string Name { get; set; }
        public int Points { get; set; }

        public List<Player> Players { get; set; }
    }

    public class Player
    {
        public Player()
        {
            UserId = "";
            Name = "";
            OnaTeam = false;
        }

        public string UserId { get; set; }
        public bool OnaTeam { get; set; }
        public string Name { get; set; }
    }

    public class LoadGamePlay
    {
        GamePlayTestLoad gplay = new GamePlayTestLoad();
        List<string> list = new List<string>();

        public void LoadPlayers()
        {
            //use identity to load the current members of the Teams meeting

            list = gplay.GetPlayers();
        }


        public List<PlayerTeams> GetPlayersTeams()
        {
            List<Player> players = new List<Player>();
            List<PlayerTeams> teams = new List<PlayerTeams>();
            int cntr = 0;
            int namecntr = 0;
            LoadPlayers();

            list.ForEach(x =>
            {
                players.Add(new Player()
                {
                    UserId = $"{x}{++cntr}",
                    Name = x
                });

                if ((cntr % 4) == 0)
                {
                    teams.Add(new PlayerTeams()
                    {
                        Players = players,
                        Id = $"{++namecntr}",
                        Name = GamePlayTestLoad.GetName(namecntr),
                        Points = 0
                    });
                }

            });

            return teams;
        }

        public List<Player> GetPlayers()
        {
            List<Player> players = new List<Player>();
            int cntr = 0;

            LoadPlayers();

            list.ForEach(x =>
            {
                players.Add(new Player()
                {
                    UserId = $"{x}{++cntr}",
                    Name = x
                });
            });

            return players;
        }
    }

    public class GamePlayTestLoad : IGamePlayersLoad
    {
        public GamePlayTestLoad()
        {

            Users = new List<string>();

            Users.Add("Clarence");
            Users.Add("Lolita");
            Users.Add("Emmanuel");
            Users.Add("Sarah");
            Users.Add("Mike");
            Users.Add("Colt");
            Users.Add("Josh");
            Users.Add("Marvin");
            Users.Add("James");
            Users.Add("Suzanne");
            Users.Add("Carlton");
            Users.Add("George");
            Users.Add("Anthony");
        }

        public List<string> Users { get; set; }

        public List<string> GetPlayers()
        {

            return Users;
        }

        //public List<string> GetPlayerObjects()
        //{
        //    List<Player> players = new List<Player>();

        //    players.ForEach(x =>
        //    {
        //        players.Add(new Player()
        //        {
        //            UserId = $"{x}{++cntr}",
        //            Name = x
        //        });

        //        if ((cntr % 4) == 0)
        //        {
        //            teams.Add(new PlayerTeams()
        //            {
        //                Players = players,
        //                Id = $"{++namecntr}",
        //                Name = GamePlayTestLoad.GetName(namecntr),
        //                Points = 0
        //            });
        //        }

        //    });



        //    return Users;
        //}
        public static string GetName(int i)
        {
            List<string> TeamName = new List<string>();

            TeamName.Add("The Scuba Divers");
            TeamName.Add("Problem Solvers");
            TeamName.Add("FPI Fielder");
            TeamName.Add("Help Deskers");
            TeamName.Add("You Tubers");
            TeamName.Add("Colt 45ers");

            return TeamName[i];
        }
    }

    public interface IGamePlayersLoad
    {


        public List<string> Users { get; set; }

        public List<string> GetPlayers();

    }


}
