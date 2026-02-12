require('dotenv').config();
const {
    createCalendarEvent,
    getCalendarEvent,
    listCalendarEvents,
    updateCalendarEvent,
    deleteCalendarEvent
} = require('./services/calendarService');
const { sendEmail } = require('./services/gmailService');

async function testMCP() {
    console.log('🧪 Testing MCP Server Functions\n');

    try {
        // Test 1: Create event
        console.log('1️⃣ Creating calendar event...');
        const event = await createCalendarEvent(
            'MCP Test User',
            '2026-02-20T15:00:00+05:30',
            45
        );
        console.log('✅ Created:', event);
        console.log('   Event ID:', event.id);
        console.log('   Link:', event.link);

        // Test 2: Get event
        console.log('\n2️⃣ Getting event details...');
        const retrieved = await getCalendarEvent(event.id);
        console.log('✅ Retrieved:', retrieved.summary);

        // Test 3: List events
        console.log('\n3️⃣ Listing events for February 2026...');
        const events = await listCalendarEvents(
            '2026-02-01T00:00:00+05:30',
            '2026-02-28T23:59:59+05:30',
            10
        );
        console.log(`✅ Found ${events.length} events`);
        events.forEach(e => console.log(`   - ${e.summary} (${e.start})`));

        // Test 4: Update event
        console.log('\n4️⃣ Updating event...');
        const updated = await updateCalendarEvent(event.id, {
            name: 'Updated MCP Test',
            duration: 60
        });
        console.log('✅ Updated:', updated.summary);

        // Test 5: Send email
        console.log('\n5️⃣ Sending test email...');
        const email = await sendEmail(
            'alokranjan04@gmail.com',
            'MCP Test Email',
            'This is a test email from the MCP server. All systems working!'
        );
        console.log('✅ Email sent, Message ID:', email.id);

        // Test 6: Delete event
        console.log('\n6️⃣ Deleting test event...');
        const deleted = await deleteCalendarEvent(event.id);
        console.log('✅ Deleted:', deleted.message);

        console.log('\n🎉 All tests passed! MCP server is working correctly.');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run tests
console.log('Starting MCP tests...');
console.log('Make sure you have authenticated first!\n');
testMCP();
