import chai from "chai";
import { assert } from "chai";

chai.should();

import { getPrefixFromMessage } from "../src/background/utils.js";

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