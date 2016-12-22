var should = require('chai').should(),
    TemplateEngine = require('../src/template-engine');

describe('Template engine module: #equals', function() {
    var template =
        '<p>' +
            'Hello, my name is <%this.name%>. I am <%this.profile.age%> years old and very <%this.state%>' +
        '</p>';

    it('verfied if basic template with dynamic content is returned', function() {
        var finalTemplate = TemplateEngine(template, {
            name: 'Jhon',
            profile: {age: 34},
            state: 'cute'
        });
        finalTemplate.should.equal('<p>Hello, my name is Jhon. I am 34 years old and very cute</p>');
    });
});
