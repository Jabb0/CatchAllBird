import chai from "chai";
import { assert } from "chai";

chai.should();

import { getPrefixFromMessage } from "../src/background/utils.js";
import { moveMessages } from "../src/background/processing.js";

describe("getPrefixFromMessage()", function () {
    describe("with only email in recipient", function() {
        it("should find prefix in recipient", function() {
            const domain = "acme.com";
            const recipients = ["peter@something.de", "foo.bar@acme.com", "bliblu123@bla.to"];
            const ccList = ["bla@test.it"]
            const bccList = [];
    
            const prefix = getPrefixFromMessage(domain, recipients, ccList, bccList);
    
            prefix.should.equal("foo.bar");
        });
    
        it("should return null if recipient is missing", function() {
            const domain = "acme.com";
            const recipients = ["peter@something.de", "bliblu123@bla.to"];
            const ccList = ["bla@test.it"]
            const bccList = [];
    
            const prefix = getPrefixFromMessage(domain, recipients, ccList, bccList);
    
            assert.isNull(prefix);
        });
    
        it("should return the first recipient found", function() {
            const domain = "acme.com";
            const recipients = ["peter@something.de", "foo.bar@acme.com", "bliblu123@bla.to", "notmeplease@acme.com"];
            const ccList = ["bla@test.it"]
            const bccList = [];
    
            const prefix = getPrefixFromMessage(domain, recipients, ccList, bccList);
    
            prefix.should.equal("foo.bar");
        });
    
        it("should return prefix from recipient before ccList or bccList", function() {
            const domain = "acme.com";
            const recipients = ["peter@something.de", "foo.bar@acme.com", "bliblu123@bla.to"];
            const ccList = ["bla@test.it", "notmeplease@acme.com"]
            const bccList = ["also.notmeplease@acme.com"];
    
            const prefix = getPrefixFromMessage(domain, recipients, ccList, bccList);
    
            prefix.should.equal("foo.bar");
        });
    
        it("should return prefix from ccList", function() {
            const domain = "acme.com";
            const recipients = ["peter@something.de", "bliblu123@bla.to"];
            const ccList = ["bla@test.it", "me@acme.com"]
            const bccList = [];
    
            const prefix = getPrefixFromMessage(domain, recipients, ccList, bccList);
    
            prefix.should.equal("me");
        });
    
        it("should return prefix from ccList before bccList", function() {
            const domain = "acme.com";
            const recipients = ["peter@something.de", "bliblu123@bla.to"];
            const ccList = ["bla@test.it", "foo.bar@acme.com"]
            const bccList = ["notmeplease@acme.com"];
    
            const prefix = getPrefixFromMessage(domain, recipients, ccList, bccList);
    
            prefix.should.equal("foo.bar");
        });
    
        it("should return null if all lists are empty", function() {
            const domain = "acme.com";
            const recipients = [];
            const ccList = []
            const bccList = [];
    
            const prefix = getPrefixFromMessage(domain, recipients, ccList, bccList);
    
            assert.isNull(prefix);
        });
    
        it("should return prefix from bccList", function() {
            const domain = "acme.com";
            const recipients = ["peter@something.de", "bliblu123@bla.to"];
            const ccList = ["bla@test.it"]
            const bccList = ["foo.bar@acme.com"];
    
            const prefix = getPrefixFromMessage(domain, recipients, ccList, bccList);
    
            prefix.should.equal("foo.bar");
        });
    
        it("should find the prefix with case insensitive domain", function() {
            const domain = "aCMe.cOm";
            const recipients = ["peter@something.de", "bliblu123@bla.to", "foo.bar@AcMe.com"];
            const ccList = [];
            const bccList = [];
    
            const prefix = getPrefixFromMessage(domain, recipients, ccList, bccList);
    
            prefix.should.equal("foo.bar");
        });
    });


    describe("with email contained in other text", function() {
        it("should find prefix in recipient with format: NAME <email>", function() {
            const domain = "acme.com";
            const recipients = ["peter@something.de", "F. B. <foo.bar@acme.com>", "bliblu123@bla.to"];
            const ccList = ["bla@test.it"]
            const bccList = [];
    
            const prefix = getPrefixFromMessage(domain, recipients, ccList, bccList);
    
            prefix.should.equal("foo.bar");
        });

        it("should find prefix in recipient with format: NAME email", function() {
            const domain = "acme.com";
            const recipients = ["peter@something.de", "F. B. foo.bar@acme.com", "bliblu123@bla.to"];
            const ccList = ["bla@test.it"]
            const bccList = [];
    
            const prefix = getPrefixFromMessage(domain, recipients, ccList, bccList);
    
            prefix.should.equal("foo.bar");
        });

        it("should find prefix in recipient with format: NAME email2 email", function() {
            const domain = "acme.com";
            const recipients = ["peter@something.de", "F. B. foo.bar@acme.com foo.bar2@acme.com", "bliblu123@bla.to"];
            const ccList = ["bla@test.it"]
            const bccList = [];
    
            const prefix = getPrefixFromMessage(domain, recipients, ccList, bccList);
    
            prefix.should.equal("foo.bar2");
        });
    });
});

describe("moveMessages()", function() {
    it("should create new folder if necessary", async function() {
        const parentFolder = {
            accountId: "blaa",
            path: "blub",
            name: "blub",
            id: "parentFolderId"
            // subFolders: []
        }
        messenger.folders.getSubFolders.mockImplementation(async () => {
            return [];
        });

        const mailIds = [1,3,5];

        const mailMapping = new Map();
        mailMapping.set("peter", mailIds);

        const newFolder = {
            accountId: "blaa",
            path: "blub.peter",
            name: "peter",
            folderId: "xyz"
            // subFolders: []
        }

        messenger.folders.create.mockImplementation(async () => {
            return newFolder;
        });


        moveMessages(parentFolder, mailMapping);

        await expect(messenger.folders.getSubFolders).toHaveBeenCalledWith(parentFolder.id, false);
        await expect(messenger.folders.create).toHaveBeenCalledWith(parentFolder.id, "peter");
        await expect(messenger.messages.move).toHaveBeenCalledWith(mailIds, newFolder.id);
    })

    it("should create new folder with dot replacement if necessary", async function() {
        const parentFolder = {
            accountId: "blaa",
            path: "blub",
            name: "blub",
            id: "parentFolderId"
            // subFolders: []
        }
        messenger.folders.getSubFolders.mockImplementation(async () => {
            return [];
        });

        const mailIds = [1,3,5];

        const mailMapping = new Map();
        mailMapping.set("peter.hans.wurst", mailIds);

        const newFolder = {
            accountId: "blaa",
            path: "blub.peterDOThansDOTwurst",
            name: "peterDOThansDOTwurst",
            id: "xyz"
            // subFolders: []
        }

        messenger.folders.create.mockImplementation(async () => {
            return newFolder;
        });


        moveMessages(parentFolder, mailMapping);

        await expect(messenger.folders.getSubFolders).toHaveBeenCalledWith(parentFolder.id, false);
        await expect(messenger.folders.create).toHaveBeenCalledWith(parentFolder.id, "peterDOThansDOTwurst");
        await expect(messenger.messages.move).toHaveBeenCalledWith(mailIds, newFolder.id);
    })
});