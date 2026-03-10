#!/usr/bin/env node
/**
 * setup_test_accounts.mjs — One-time script to create test accounts in Supabase.
 * Run: node tools/setup_test_accounts.mjs
 */

const SUPABASE_URL = "https://xjcygntnkjkgvyynldzf.supabase.co";
const SERVICE_ROLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqY3lnbnRua2prZ3Z5eW5sZHpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIyMDI4NCwiZXhwIjoyMDg3Nzk2Mjg0fQ.y9RnDxJyRjO-vgojxC2Itc6vNz08j2SxseyiMp0irFw";

const TEST_PASSWORD = "TestAgent2026!Secure";

const ACCOUNTS = [
  {
    email: "test-athlete@sportsphere.app",
    full_name: "Test Athlete",
    role: "athlete",
    sport: "Basketball",
  },
  {
    email: "test-coach@sportsphere.app",
    full_name: "Test Coach",
    role: "coach",
    sport: "Basketball",
  },
  {
    email: "test-org@sportsphere.app",
    full_name: "Test Organization",
    role: "organization",
    sport: "Basketball",
  },
  {
    email: "test-parent@sportsphere.app",
    full_name: "Test Parent",
    role: "parent",
    sport: "Basketball",
  },
];

async function createAccount(account) {
  console.log(`  Creating ${account.email} (${account.role})...`);

  // 1. Create auth user via Admin API
  const authResp = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE}`,
      apikey: SERVICE_ROLE,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: account.email,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: account.full_name,
        role: account.role,
      },
    }),
  });

  const authData = await authResp.json();

  if (!authResp.ok) {
    if (authData?.msg?.includes("already been registered") || authData?.message?.includes("already been registered")) {
      console.log(`    → Already exists, skipping auth creation`);
    } else {
      console.error(`    ✗ Auth error:`, JSON.stringify(authData));
      return;
    }
  } else {
    console.log(`    ✓ Auth user created (id: ${authData.id})`);
  }

  // 2. Upsert profile (the trigger may have already created it)
  // Wait a moment for the trigger to fire
  await new Promise((r) => setTimeout(r, 2000));

  const profileResp = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(account.email)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${SERVICE_ROLE}`,
        apikey: SERVICE_ROLE,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        full_name: account.full_name,
        role: account.role,
        onboarding_complete: true,
      }),
    }
  );

  if (profileResp.ok) {
    console.log(`    ✓ Profile updated`);
  } else {
    const err = await profileResp.text();
    console.error(`    ⚠ Profile update: ${err}`);
  }
}

async function main() {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║  Setting up Sportsphere test accounts               ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  for (const account of ACCOUNTS) {
    await createAccount(account);
    console.log("");
  }

  console.log("Done! Test accounts are ready.\n");
  console.log("Credentials for all accounts:");
  console.log(`  Password: ${TEST_PASSWORD}`);
  console.log("  Emails:");
  for (const a of ACCOUNTS) {
    console.log(`    - ${a.email} (${a.role})`);
  }
}

main().catch(console.error);
