import "dotenv/config";
import { Pool as NeonPool } from '@neondatabase/serverless';
import { drizzle as neonDrizzle } from 'drizzle-orm/neon-serverless';
import { Pool as PgPool } from 'pg';
import { drizzle as pgDrizzle } from 'drizzle-orm/node-postgres';
import ws from "ws";
import * as schema from "../shared/schema";
import { neonConfig } from '@neondatabase/serverless';

// Setup Neon WebSocket
neonConfig.webSocketConstructor = ws;

// Neon Database Connection (Source)
if (!process.env.NEON_DATABASE_URL) {
  throw new Error("NEON_DATABASE_URL must be set for migration");
}

const neonPool = new NeonPool({ connectionString: process.env.NEON_DATABASE_URL });
const neonDb = neonDrizzle({ client: neonPool, schema });

// Supabase Database Connection (Target)
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL (Supabase) must be set for migration");
}

// Parse DATABASE_URL for Supabase
let connectionString = process.env.DATABASE_URL;
const match = connectionString.match(/^postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/);
if (!match) {
  throw new Error("Invalid DATABASE_URL format");
}

const [, user, password, host, port, database] = match;

const supabasePool = new PgPool({ 
  host,
  port: parseInt(port, 10),
  database,
  user,
  password,
  ssl: { rejectUnauthorized: false }
});

const supabaseDb = pgDrizzle({ client: supabasePool, schema });

/**
 * Migrate data from Neon to Supabase
 */
async function migrateData() {
  console.log("🚀 Starting migration from Neon to Supabase...\n");

  try {
    // 1. Migrate Users
    console.log("📦 Migrating users...");
    const neonUsers = await neonDb.select().from(schema.users);
    if (neonUsers.length > 0) {
      // Check existing users in Supabase to avoid duplicates
      const existingUsers = await supabaseDb.select().from(schema.users);
      const existingEmails = new Set(existingUsers.map(u => u.email));
      const existingUsernames = new Set(existingUsers.map(u => u.username));
      const existingEmployeeIds = new Set(existingUsers.map(u => u.employeeId));

      const usersToInsert = neonUsers.filter(user => 
        !existingEmails.has(user.email) && 
        !existingUsernames.has(user.username) &&
        !existingEmployeeIds.has(user.employeeId)
      );

      if (usersToInsert.length > 0) {
        await supabaseDb.insert(schema.users).values(usersToInsert);
        console.log(`✅ Migrated ${usersToInsert.length} users`);
      } else {
        console.log("ℹ️  All users already exist in Supabase");
      }
    } else {
      console.log("ℹ️  No users to migrate");
    }

    // 2. Migrate Events
    console.log("\n📦 Migrating events...");
    const neonEvents = await neonDb.select().from(schema.events);
    if (neonEvents.length > 0) {
      const existingEvents = await supabaseDb.select().from(schema.events);
      const existingEventIds = new Set(existingEvents.map(e => e.id));
      
      const eventsToInsert = neonEvents.filter(event => !existingEventIds.has(event.id));
      
      if (eventsToInsert.length > 0) {
        await supabaseDb.insert(schema.events).values(eventsToInsert);
        console.log(`✅ Migrated ${eventsToInsert.length} events`);
      } else {
        console.log("ℹ️  All events already exist in Supabase");
      }
    } else {
      console.log("ℹ️  No events to migrate");
    }

    // 3. Migrate News
    console.log("\n📦 Migrating news...");
    const neonNews = await neonDb.select().from(schema.news);
    if (neonNews.length > 0) {
      const existingNews = await supabaseDb.select().from(schema.news);
      const existingNewsIds = new Set(existingNews.map(n => n.id));
      
      const newsToInsert = neonNews.filter(news => !existingNewsIds.has(news.id));
      
      if (newsToInsert.length > 0) {
        await supabaseDb.insert(schema.news).values(newsToInsert);
        console.log(`✅ Migrated ${newsToInsert.length} news items`);
      } else {
        console.log("ℹ️  All news already exist in Supabase");
      }
    } else {
      console.log("ℹ️  No news to migrate");
    }

    // 4. Migrate Results
    console.log("\n📦 Migrating results...");
    const neonResults = await neonDb.select().from(schema.results);
    if (neonResults.length > 0) {
      const existingResults = await supabaseDb.select().from(schema.results);
      const existingResultIds = new Set(existingResults.map(r => r.id));
      
      // Get existing event IDs from Supabase
      const existingEvents = await supabaseDb.select().from(schema.events);
      const existingEventIds = new Set(existingEvents.map(e => e.id));
      
      const resultsToInsert = neonResults.filter(result => 
        !existingResultIds.has(result.id) &&
        (!result.eventId || existingEventIds.has(result.eventId))
      );
      
      if (resultsToInsert.length > 0) {
        await supabaseDb.insert(schema.results).values(resultsToInsert);
        console.log(`✅ Migrated ${resultsToInsert.length} results`);
        if (neonResults.length > resultsToInsert.length) {
          console.log(`⚠️  Skipped ${neonResults.length - resultsToInsert.length} results due to missing foreign keys`);
        }
      } else {
        console.log("ℹ️  All results already exist in Supabase or have missing foreign keys");
      }
    } else {
      console.log("ℹ️  No results to migrate");
    }

    // 5. Migrate Athletes
    console.log("\n📦 Migrating athletes...");
    const neonAthletes = await neonDb.select().from(schema.athletes);
    if (neonAthletes.length > 0) {
      const existingAthletes = await supabaseDb.select().from(schema.athletes);
      const existingAthleteIds = new Set(existingAthletes.map(a => a.id));
      
      const athletesToInsert = neonAthletes.filter(athlete => !existingAthleteIds.has(athlete.id));
      
      if (athletesToInsert.length > 0) {
        await supabaseDb.insert(schema.athletes).values(athletesToInsert);
        console.log(`✅ Migrated ${athletesToInsert.length} athletes`);
      } else {
        console.log("ℹ️  All athletes already exist in Supabase");
      }
    } else {
      console.log("ℹ️  No athletes to migrate");
    }

    // 6. Migrate Gallery
    console.log("\n📦 Migrating gallery...");
    const neonGallery = await neonDb.select().from(schema.gallery);
    if (neonGallery.length > 0) {
      const existingGallery = await supabaseDb.select().from(schema.gallery);
      const existingGalleryIds = new Set(existingGallery.map(g => g.id));
      
      const galleryToInsert = neonGallery.filter(item => !existingGalleryIds.has(item.id));
      
      if (galleryToInsert.length > 0) {
        await supabaseDb.insert(schema.gallery).values(galleryToInsert);
        console.log(`✅ Migrated ${galleryToInsert.length} gallery items`);
      } else {
        console.log("ℹ️  All gallery items already exist in Supabase");
      }
    } else {
      console.log("ℹ️  No gallery items to migrate");
    }

    // 7. Migrate Event Registrations
    console.log("\n📦 Migrating event registrations...");
    const neonRegistrations = await neonDb.select().from(schema.eventRegistrations);
    if (neonRegistrations.length > 0) {
      const existingRegistrations = await supabaseDb.select().from(schema.eventRegistrations);
      const existingRegistrationIds = new Set(existingRegistrations.map(r => r.id));
      
      // Get existing user IDs and event IDs from Supabase
      const existingUsers = await supabaseDb.select().from(schema.users);
      const existingUserIds = new Set(existingUsers.map(u => u.id));
      const existingEvents = await supabaseDb.select().from(schema.events);
      const existingEventIds = new Set(existingEvents.map(e => e.id));
      
      // Filter out registrations with missing foreign keys
      const registrationsToInsert = neonRegistrations.filter(reg => 
        !existingRegistrationIds.has(reg.id) &&
        existingUserIds.has(reg.userId) &&
        existingEventIds.has(reg.eventId)
      );
      
      if (registrationsToInsert.length > 0) {
        await supabaseDb.insert(schema.eventRegistrations).values(registrationsToInsert);
        console.log(`✅ Migrated ${registrationsToInsert.length} event registrations`);
        if (neonRegistrations.length > registrationsToInsert.length) {
          console.log(`⚠️  Skipped ${neonRegistrations.length - registrationsToInsert.length} registrations due to missing foreign keys`);
        }
      } else {
        console.log("ℹ️  All event registrations already exist in Supabase or have missing foreign keys");
      }
    } else {
      console.log("ℹ️  No event registrations to migrate");
    }

    // 8. Migrate Notifications
    console.log("\n📦 Migrating notifications...");
    const neonNotifications = await neonDb.select().from(schema.notifications);
    if (neonNotifications.length > 0) {
      const existingNotifications = await supabaseDb.select().from(schema.notifications);
      const existingNotificationIds = new Set(existingNotifications.map(n => n.id));
      
      // Get existing user IDs and event IDs from Supabase
      const existingUsers = await supabaseDb.select().from(schema.users);
      const existingUserIds = new Set(existingUsers.map(u => u.id));
      const existingEvents = await supabaseDb.select().from(schema.events);
      const existingEventIds = new Set(existingEvents.map(e => e.id));
      
      const notificationsToInsert = neonNotifications.filter(notif => 
        !existingNotificationIds.has(notif.id) &&
        existingUserIds.has(notif.userId) &&
        (!notif.relatedEventId || existingEventIds.has(notif.relatedEventId))
      );
      
      if (notificationsToInsert.length > 0) {
        await supabaseDb.insert(schema.notifications).values(notificationsToInsert);
        console.log(`✅ Migrated ${notificationsToInsert.length} notifications`);
        if (neonNotifications.length > notificationsToInsert.length) {
          console.log(`⚠️  Skipped ${neonNotifications.length - notificationsToInsert.length} notifications due to missing foreign keys`);
        }
      } else {
        console.log("ℹ️  All notifications already exist in Supabase or have missing foreign keys");
      }
    } else {
      console.log("ℹ️  No notifications to migrate");
    }

    // 9. Migrate Forum Posts
    console.log("\n📦 Migrating forum posts...");
    const neonForumPosts = await neonDb.select().from(schema.forumPosts);
    if (neonForumPosts.length > 0) {
      const existingForumPosts = await supabaseDb.select().from(schema.forumPosts);
      const existingForumPostIds = new Set(existingForumPosts.map(p => p.id));
      
      // Get existing user IDs and event IDs from Supabase
      const existingUsers = await supabaseDb.select().from(schema.users);
      const existingUserIds = new Set(existingUsers.map(u => u.id));
      const existingEvents = await supabaseDb.select().from(schema.events);
      const existingEventIds = new Set(existingEvents.map(e => e.id));
      
      const forumPostsToInsert = neonForumPosts.filter(post => 
        !existingForumPostIds.has(post.id) &&
        existingUserIds.has(post.userId) &&
        (!post.relatedEventId || existingEventIds.has(post.relatedEventId))
      );
      
      if (forumPostsToInsert.length > 0) {
        await supabaseDb.insert(schema.forumPosts).values(forumPostsToInsert);
        console.log(`✅ Migrated ${forumPostsToInsert.length} forum posts`);
        if (neonForumPosts.length > forumPostsToInsert.length) {
          console.log(`⚠️  Skipped ${neonForumPosts.length - forumPostsToInsert.length} forum posts due to missing foreign keys`);
        }
      } else {
        console.log("ℹ️  All forum posts already exist in Supabase or have missing foreign keys");
      }
    } else {
      console.log("ℹ️  No forum posts to migrate");
    }

    // 10. Migrate Forum Comments
    console.log("\n📦 Migrating forum comments...");
    const neonForumComments = await neonDb.select().from(schema.forumComments);
    if (neonForumComments.length > 0) {
      const existingForumComments = await supabaseDb.select().from(schema.forumComments);
      const existingForumCommentIds = new Set(existingForumComments.map(c => c.id));
      
      // Get existing user IDs and post IDs from Supabase
      const existingUsers = await supabaseDb.select().from(schema.users);
      const existingUserIds = new Set(existingUsers.map(u => u.id));
      const existingForumPosts = await supabaseDb.select().from(schema.forumPosts);
      const existingForumPostIds = new Set(existingForumPosts.map(p => p.id));
      
      const forumCommentsToInsert = neonForumComments.filter(comment => 
        !existingForumCommentIds.has(comment.id) &&
        existingUserIds.has(comment.userId) &&
        existingForumPostIds.has(comment.postId)
      );
      
      if (forumCommentsToInsert.length > 0) {
        await supabaseDb.insert(schema.forumComments).values(forumCommentsToInsert);
        console.log(`✅ Migrated ${forumCommentsToInsert.length} forum comments`);
        if (neonForumComments.length > forumCommentsToInsert.length) {
          console.log(`⚠️  Skipped ${neonForumComments.length - forumCommentsToInsert.length} forum comments due to missing foreign keys`);
        }
      } else {
        console.log("ℹ️  All forum comments already exist in Supabase or have missing foreign keys");
      }
    } else {
      console.log("ℹ️  No forum comments to migrate");
    }

    // 11. Migrate Forum Likes
    console.log("\n📦 Migrating forum likes...");
    const neonForumLikes = await neonDb.select().from(schema.forumLikes);
    if (neonForumLikes.length > 0) {
      const existingForumLikes = await supabaseDb.select().from(schema.forumLikes);
      const existingForumLikeIds = new Set(existingForumLikes.map(l => l.id));
      
      // Get existing user IDs and post IDs from Supabase
      const existingUsers = await supabaseDb.select().from(schema.users);
      const existingUserIds = new Set(existingUsers.map(u => u.id));
      const existingForumPosts = await supabaseDb.select().from(schema.forumPosts);
      const existingForumPostIds = new Set(existingForumPosts.map(p => p.id));
      
      const forumLikesToInsert = neonForumLikes.filter(like => 
        !existingForumLikeIds.has(like.id) &&
        existingUserIds.has(like.userId) &&
        existingForumPostIds.has(like.postId)
      );
      
      if (forumLikesToInsert.length > 0) {
        await supabaseDb.insert(schema.forumLikes).values(forumLikesToInsert);
        console.log(`✅ Migrated ${forumLikesToInsert.length} forum likes`);
        if (neonForumLikes.length > forumLikesToInsert.length) {
          console.log(`⚠️  Skipped ${neonForumLikes.length - forumLikesToInsert.length} forum likes due to missing foreign keys`);
        }
      } else {
        console.log("ℹ️  All forum likes already exist in Supabase or have missing foreign keys");
      }
    } else {
      console.log("ℹ️  No forum likes to migrate");
    }

    // 12. Migrate Tournaments
    console.log("\n📦 Migrating tournaments...");
    const neonTournaments = await neonDb.select().from(schema.tournaments);
    if (neonTournaments.length > 0) {
      const existingTournaments = await supabaseDb.select().from(schema.tournaments);
      const existingTournamentIds = new Set(existingTournaments.map(t => t.id));
      
      const tournamentsToInsert = neonTournaments.filter(tournament => !existingTournamentIds.has(tournament.id));
      
      if (tournamentsToInsert.length > 0) {
        await supabaseDb.insert(schema.tournaments).values(tournamentsToInsert);
        console.log(`✅ Migrated ${tournamentsToInsert.length} tournaments`);
      } else {
        console.log("ℹ️  All tournaments already exist in Supabase");
      }
    } else {
      console.log("ℹ️  No tournaments to migrate");
    }

    // 13. Migrate Teams
    console.log("\n📦 Migrating teams...");
    const neonTeams = await neonDb.select().from(schema.teams);
    if (neonTeams.length > 0) {
      const existingTeams = await supabaseDb.select().from(schema.teams);
      const existingTeamIds = new Set(existingTeams.map(t => t.id));
      
      // Insert all teams regardless of foreign keys (set null for missing foreign keys)
      const teamsToInsert = neonTeams
        .filter(team => !existingTeamIds.has(team.id))
        .map(team => {
          // Get existing tournament IDs and user IDs from Supabase
          const existingTournaments = existingTeams.length > 0 ? 
            (async () => {
              const tournaments = await supabaseDb.select().from(schema.tournaments);
              return new Set(tournaments.map(t => t.id));
            })() : Promise.resolve(new Set());
          const existingUsers = existingTeams.length > 0 ?
            (async () => {
              const users = await supabaseDb.select().from(schema.users);
              return new Set(users.map(u => u.id));
            })() : Promise.resolve(new Set());
          
          return {
            ...team,
            tournamentId: team.tournamentId || null,
            captainId: team.captainId || null,
          };
        });
      
      if (teamsToInsert.length > 0) {
        // Get existing IDs to check foreign keys
        const existingTournaments = await supabaseDb.select().from(schema.tournaments);
        const existingTournamentIds = new Set(existingTournaments.map(t => t.id));
        const existingUsers = await supabaseDb.select().from(schema.users);
        const existingUserIds = new Set(existingUsers.map(u => u.id));
        
        // Set null for missing foreign keys
        const teamsWithNullFKs = teamsToInsert.map(team => ({
          ...team,
          tournamentId: team.tournamentId && existingTournamentIds.has(team.tournamentId) ? team.tournamentId : null,
          captainId: team.captainId && existingUserIds.has(team.captainId) ? team.captainId : null,
        }));
        
        await supabaseDb.insert(schema.teams).values(teamsWithNullFKs);
        console.log(`✅ Migrated ${teamsWithNullFKs.length} teams (foreign keys set to null if missing)`);
      } else {
        console.log("ℹ️  All teams already exist in Supabase");
      }
    } else {
      console.log("ℹ️  No teams to migrate");
    }

    // 14. Migrate Players
    console.log("\n📦 Migrating players...");
    const neonPlayers = await neonDb.select().from(schema.players);
    if (neonPlayers.length > 0) {
      const existingPlayers = await supabaseDb.select().from(schema.players);
      const existingPlayerIds = new Set(existingPlayers.map(p => p.id));
      
      // Get existing team IDs and user IDs from Supabase
      const existingTeams = await supabaseDb.select().from(schema.teams);
      const existingTeamIds = new Set(existingTeams.map(t => t.id));
      const existingUsers = await supabaseDb.select().from(schema.users);
      const existingUserIds = new Set(existingUsers.map(u => u.id));
      
      const playersToInsert = neonPlayers.filter(player => 
        !existingPlayerIds.has(player.id) &&
        (!player.teamId || existingTeamIds.has(player.teamId)) &&
        (!player.userId || existingUserIds.has(player.userId))
      );
      
      if (playersToInsert.length > 0) {
        await supabaseDb.insert(schema.players).values(playersToInsert);
        console.log(`✅ Migrated ${playersToInsert.length} players`);
        if (neonPlayers.length > playersToInsert.length) {
          console.log(`⚠️  Skipped ${neonPlayers.length - playersToInsert.length} players due to missing foreign keys`);
        }
      } else {
        console.log("ℹ️  All players already exist in Supabase or have missing foreign keys");
      }
    } else {
      console.log("ℹ️  No players to migrate");
    }

    // 15. Migrate Referees
    console.log("\n📦 Migrating referees...");
    const neonReferees = await neonDb.select().from(schema.referees);
    if (neonReferees.length > 0) {
      const existingReferees = await supabaseDb.select().from(schema.referees);
      const existingRefereeIds = new Set(existingReferees.map(r => r.id));
      
      // Get existing tournament IDs from Supabase
      const existingTournaments = await supabaseDb.select().from(schema.tournaments);
      const existingTournamentIds = new Set(existingTournaments.map(t => t.id));
      
      const refereesToInsert = neonReferees.filter(referee => 
        !existingRefereeIds.has(referee.id) &&
        (!referee.tournamentId || existingTournamentIds.has(referee.tournamentId))
      );
      
      if (refereesToInsert.length > 0) {
        await supabaseDb.insert(schema.referees).values(refereesToInsert);
        console.log(`✅ Migrated ${refereesToInsert.length} referees`);
        if (neonReferees.length > refereesToInsert.length) {
          console.log(`⚠️  Skipped ${neonReferees.length - refereesToInsert.length} referees due to missing foreign keys`);
        }
      } else {
        console.log("ℹ️  All referees already exist in Supabase or have missing foreign keys");
      }
    } else {
      console.log("ℹ️  No referees to migrate");
    }

    // 16. Migrate Matches
    console.log("\n📦 Migrating matches...");
    const neonMatches = await neonDb.select().from(schema.matches);
    if (neonMatches.length > 0) {
      const existingMatches = await supabaseDb.select().from(schema.matches);
      const existingMatchIds = new Set(existingMatches.map(m => m.id));
      
      // Get existing tournament IDs and team IDs from Supabase
      const existingTournaments = await supabaseDb.select().from(schema.tournaments);
      const existingTournamentIds = new Set(existingTournaments.map(t => t.id));
      const existingTeams = await supabaseDb.select().from(schema.teams);
      const existingTeamIds = new Set(existingTeams.map(t => t.id));
      
      // Insert all matches, set null for missing foreign keys (except tournamentId which is required)
      const matchesToInsert = neonMatches
        .filter(match => !existingMatchIds.has(match.id))
        .map(match => ({
          ...match,
          tournamentId: existingTournamentIds.has(match.tournamentId) ? match.tournamentId : match.tournamentId, // Keep original even if missing
          homeTeamId: match.homeTeamId && existingTeamIds.has(match.homeTeamId) ? match.homeTeamId : null,
          awayTeamId: match.awayTeamId && existingTeamIds.has(match.awayTeamId) ? match.awayTeamId : null,
          nextMatchId: match.nextMatchId && existingMatchIds.has(match.nextMatchId) ? match.nextMatchId : null,
        }));
      
      // Filter out matches with missing required tournamentId
      const validMatches = matchesToInsert.filter(match => existingTournamentIds.has(match.tournamentId));
      
      if (validMatches.length > 0) {
        await supabaseDb.insert(schema.matches).values(validMatches);
        console.log(`✅ Migrated ${validMatches.length} matches (foreign keys set to null if missing)`);
        if (matchesToInsert.length > validMatches.length) {
          console.log(`⚠️  Skipped ${matchesToInsert.length - validMatches.length} matches due to missing tournamentId`);
        }
      } else {
        console.log("ℹ️  All matches already exist in Supabase or have missing tournamentId");
      }
    } else {
      console.log("ℹ️  No matches to migrate");
    }

    // 17. Migrate Match Events
    console.log("\n📦 Migrating match events...");
    const neonMatchEvents = await neonDb.select().from(schema.matchEvents);
    if (neonMatchEvents.length > 0) {
      const existingMatchEvents = await supabaseDb.select().from(schema.matchEvents);
      const existingMatchEventIds = new Set(existingMatchEvents.map(e => e.id));
      
      // Get existing match IDs, team IDs, and player IDs from Supabase
      const existingMatches = await supabaseDb.select().from(schema.matches);
      const existingMatchIds = new Set(existingMatches.map(m => m.id));
      const existingTeams = await supabaseDb.select().from(schema.teams);
      const existingTeamIds = new Set(existingTeams.map(t => t.id));
      const existingPlayers = await supabaseDb.select().from(schema.players);
      const existingPlayerIds = new Set(existingPlayers.map(p => p.id));
      
      const matchEventsToInsert = neonMatchEvents.filter(event => 
        !existingMatchEventIds.has(event.id) &&
        existingMatchIds.has(event.matchId) &&
        existingTeamIds.has(event.teamId) &&
        (!event.playerId || existingPlayerIds.has(event.playerId)) &&
        (!event.relatedPlayerId || existingPlayerIds.has(event.relatedPlayerId))
      );
      
      if (matchEventsToInsert.length > 0) {
        await supabaseDb.insert(schema.matchEvents).values(matchEventsToInsert);
        console.log(`✅ Migrated ${matchEventsToInsert.length} match events`);
        if (neonMatchEvents.length > matchEventsToInsert.length) {
          console.log(`⚠️  Skipped ${neonMatchEvents.length - matchEventsToInsert.length} match events due to missing foreign keys`);
        }
      } else {
        console.log("ℹ️  All match events already exist in Supabase or have missing foreign keys");
      }
    } else {
      console.log("ℹ️  No match events to migrate");
    }

    // 18. Migrate Match Lineups
    console.log("\n📦 Migrating match lineups...");
    const neonMatchLineups = await neonDb.select().from(schema.matchLineups);
    if (neonMatchLineups.length > 0) {
      const existingMatchLineups = await supabaseDb.select().from(schema.matchLineups);
      const existingMatchLineupIds = new Set(existingMatchLineups.map(l => l.id));
      
      // Get existing match IDs, team IDs, and player IDs from Supabase
      const existingMatches = await supabaseDb.select().from(schema.matches);
      const existingMatchIds = new Set(existingMatches.map(m => m.id));
      const existingTeams = await supabaseDb.select().from(schema.teams);
      const existingTeamIds = new Set(existingTeams.map(t => t.id));
      const existingPlayers = await supabaseDb.select().from(schema.players);
      const existingPlayerIds = new Set(existingPlayers.map(p => p.id));
      
      const matchLineupsToInsert = neonMatchLineups.filter(lineup => 
        !existingMatchLineupIds.has(lineup.id) &&
        existingMatchIds.has(lineup.matchId) &&
        existingTeamIds.has(lineup.teamId) &&
        existingPlayerIds.has(lineup.playerId)
      );
      
      if (matchLineupsToInsert.length > 0) {
        await supabaseDb.insert(schema.matchLineups).values(matchLineupsToInsert);
        console.log(`✅ Migrated ${matchLineupsToInsert.length} match lineups`);
        if (neonMatchLineups.length > matchLineupsToInsert.length) {
          console.log(`⚠️  Skipped ${neonMatchLineups.length - matchLineupsToInsert.length} match lineups due to missing foreign keys`);
        }
      } else {
        console.log("ℹ️  All match lineups already exist in Supabase or have missing foreign keys");
      }
    } else {
      console.log("ℹ️  No match lineups to migrate");
    }

    // 19. Migrate Match Comments
    console.log("\n📦 Migrating match comments...");
    const neonMatchComments = await neonDb.select().from(schema.matchComments);
    if (neonMatchComments.length > 0) {
      const existingMatchComments = await supabaseDb.select().from(schema.matchComments);
      const existingMatchCommentIds = new Set(existingMatchComments.map(c => c.id));
      
      // Get existing match IDs and user IDs from Supabase
      const existingMatches = await supabaseDb.select().from(schema.matches);
      const existingMatchIds = new Set(existingMatches.map(m => m.id));
      const existingUsers = await supabaseDb.select().from(schema.users);
      const existingUserIds = new Set(existingUsers.map(u => u.id));
      
      const matchCommentsToInsert = neonMatchComments.filter(comment => 
        !existingMatchCommentIds.has(comment.id) &&
        existingMatchIds.has(comment.matchId) &&
        existingUserIds.has(comment.userId)
      );
      
      if (matchCommentsToInsert.length > 0) {
        await supabaseDb.insert(schema.matchComments).values(matchCommentsToInsert);
        console.log(`✅ Migrated ${matchCommentsToInsert.length} match comments`);
        if (neonMatchComments.length > matchCommentsToInsert.length) {
          console.log(`⚠️  Skipped ${neonMatchComments.length - matchCommentsToInsert.length} match comments due to missing foreign keys`);
        }
      } else {
        console.log("ℹ️  All match comments already exist in Supabase or have missing foreign keys");
      }
    } else {
      console.log("ℹ️  No match comments to migrate");
    }

    // 20. Migrate Team Evaluations
    console.log("\n📦 Migrating team evaluations...");
    const neonTeamEvaluations = await neonDb.select().from(schema.teamEvaluations);
    if (neonTeamEvaluations.length > 0) {
      const existingTeamEvaluations = await supabaseDb.select().from(schema.teamEvaluations);
      const existingTeamEvaluationIds = new Set(existingTeamEvaluations.map(e => e.id));
      
      // Get existing team IDs, match IDs, and user IDs from Supabase
      const existingTeams = await supabaseDb.select().from(schema.teams);
      const existingTeamIds = new Set(existingTeams.map(t => t.id));
      const existingMatches = await supabaseDb.select().from(schema.matches);
      const existingMatchIds = new Set(existingMatches.map(m => m.id));
      const existingUsers = await supabaseDb.select().from(schema.users);
      const existingUserIds = new Set(existingUsers.map(u => u.id));
      
      const teamEvaluationsToInsert = neonTeamEvaluations.filter(evaluation => 
        !existingTeamEvaluationIds.has(evaluation.id) &&
        existingTeamIds.has(evaluation.teamId) &&
        existingMatchIds.has(evaluation.matchId) &&
        (!evaluation.evaluatorId || existingUserIds.has(evaluation.evaluatorId))
      );
      
      if (teamEvaluationsToInsert.length > 0) {
        await supabaseDb.insert(schema.teamEvaluations).values(teamEvaluationsToInsert);
        console.log(`✅ Migrated ${teamEvaluationsToInsert.length} team evaluations`);
        if (neonTeamEvaluations.length > teamEvaluationsToInsert.length) {
          console.log(`⚠️  Skipped ${neonTeamEvaluations.length - teamEvaluationsToInsert.length} team evaluations due to missing foreign keys`);
        }
      } else {
        console.log("ℹ️  All team evaluations already exist in Supabase or have missing foreign keys");
      }
    } else {
      console.log("ℹ️  No team evaluations to migrate");
    }

    // 21. Migrate Site Settings
    console.log("\n📦 Migrating site settings...");
    const neonSettings = await neonDb.select().from(schema.siteSettings);
    if (neonSettings.length > 0) {
      const existingSettings = await supabaseDb.select().from(schema.siteSettings);
      const existingSettingKeys = new Set(existingSettings.map(s => s.key));
      
      const settingsToInsert = neonSettings.filter(setting => !existingSettingKeys.has(setting.key));
      
      if (settingsToInsert.length > 0) {
        await supabaseDb.insert(schema.siteSettings).values(settingsToInsert);
        console.log(`✅ Migrated ${settingsToInsert.length} site settings`);
      } else {
        console.log("ℹ️  All site settings already exist in Supabase");
      }
    } else {
      console.log("ℹ️  No site settings to migrate");
    }

    console.log("\n✨ Migration completed successfully!");
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    // Close connections
    await neonPool.end();
    await supabasePool.end();
  }
}

// Run migration
migrateData()
  .then(() => {
    console.log("\n✅ Migration process finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Migration process failed:", error);
    process.exit(1);
  });
