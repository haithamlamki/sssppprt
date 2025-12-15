import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Home from "@/pages/home";
import Events from "@/pages/events";
import Gallery from "@/pages/gallery";
import Results from "@/pages/results";
import About from "@/pages/about";
import Login from "@/pages/login";
import Register from "@/pages/register";
import MyEvents from "@/pages/my-events";
import Admin from "@/pages/admin";
import Profile from "@/pages/profile";
import Forum from "@/pages/forum";
import Leagues from "@/pages/leagues";
import LeagueDetail from "@/pages/league-detail";
import MatchDetail from "@/pages/match-detail";
import TeamWizard from "@/pages/team-wizard";
import Bracket from "@/pages/bracket";
import TournamentEdit from "@/pages/tournament-edit";
import Chats from "@/pages/chats";
import EventHub from "@/pages/event-hub";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/events" component={Events} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/results" component={Results} />
      <Route path="/about" component={About} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/my-events" component={MyEvents} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/tournaments/:id/edit" component={TournamentEdit} />
      <Route path="/profile" component={Profile} />
      <Route path="/forum" component={Forum} />
      <Route path="/leagues" component={Leagues} />
      <Route path="/leagues/:id" component={LeagueDetail} />
      <Route path="/matches/:id" component={MatchDetail} />
      <Route path="/team-wizard" component={TeamWizard} />
      <Route path="/bracket" component={Bracket} />
      <Route path="/chats" component={Chats} />
      <Route path="/event-hubs/:id" component={EventHub} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">
                <Router />
              </main>
              <Footer />
            </div>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
