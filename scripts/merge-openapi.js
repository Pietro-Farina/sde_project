const fs = require('fs');
const path = require('path');

const services = [
  {
    name: 'Booking Orchestrator',
    file: './backend/booking-orchestrator/src/openapi.json',
    pathPrefix: '/booking-orchestrator',
    description: 'Main orchestration service that coordinates authentication, bookings, payments and course management'
  },
  {
    name: 'Booking Logic',
    file: './backend/booking-logic/src/openapi.json',
    pathPrefix: '/booking-logic',
    description: 'Business logic service for managing bookings and reservations'
  },
  {
    name: 'Booking Data',
    file: './backend/booking-data/src/openapi.json',
    pathPrefix: '/booking-data',
    description: 'Data persistence layer for bookings, courses, and reservations'
  },
  {
    name: 'OAuth Adapter',
    file: './backend/oauth-adapter/src/openapi.json',
    pathPrefix: '/oauth-adapter',
    description: 'OAuth authentication adapter service'
  },
  {
    name: 'PayPal Adapter',
    file: './backend/paypal-adapter/src/openapi.json',
    pathPrefix: '/paypal-adapter',
    description: 'PayPal payment integration service'
  }
];

// Initialize merged spec
const merged = {
  openapi: '3.1.0',
  info: {
    title: 'Booking System - Combined API',
    version: '1.0.0',
    description: 'Unified API documentation for all booking system services'
  },
  tags: [],
  paths: {},
  components: {
    schemas: {},
    responses: {},
    parameters: {},
    securitySchemes: {}
  }
};

// Helper function to update $ref references recursively
function updateRefs(obj, servicePrefix) {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => updateRefs(item, servicePrefix));
  }
  
  const updated = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === '$ref' && typeof value === 'string' && value.startsWith('#/components/')) {
      // Update reference to include service prefix
      const refParts = value.split('/');
      const refName = refParts[refParts.length - 1];
      refParts[refParts.length - 1] = `${servicePrefix}_${refName}`;
      updated[key] = refParts.join('/');
    } else if (typeof value === 'object') {
      updated[key] = updateRefs(value, servicePrefix);
    } else {
      updated[key] = value;
    }
  }
  return updated;
}

// Process each service
services.forEach(({ name, file, pathPrefix, description }) => {
  try {
    const spec = JSON.parse(fs.readFileSync(file, 'utf8'));
    
    // Add service tag
    merged.tags.push({
      name: name,
      description: description
    });
    
    const servicePrefix = name.replace(/\s+/g, '').replace(/-/g, '');
    
    // Merge paths with prefix and update refs
    Object.entries(spec.paths || {}).forEach(([pathName, pathItem]) => {
      const newPath = pathPrefix + pathName;
      
      // Replace original tags with service name only
      const updatedPathItem = {};
      Object.entries(pathItem).forEach(([method, operation]) => {
        if (typeof operation === 'object' && operation !== null) {
          const updatedOperation = updateRefs(operation, servicePrefix);
          updatedPathItem[method] = {
            ...updatedOperation,
            tags: [name] // Replace tags entirely with just the service name
          };
        }
      });
      
      merged.paths[newPath] = updatedPathItem;
    });
    
    // Merge components with service prefix to avoid conflicts
    if (spec.components?.schemas) {
      Object.entries(spec.components.schemas).forEach(([schemaName, schema]) => {
        const updatedSchema = updateRefs(schema, servicePrefix);
        merged.components.schemas[`${servicePrefix}_${schemaName}`] = updatedSchema;
      });
    }
    
    if (spec.components?.responses) {
      Object.entries(spec.components.responses).forEach(([responseName, response]) => {
        const updatedResponse = updateRefs(response, servicePrefix);
        merged.components.responses[`${servicePrefix}_${responseName}`] = updatedResponse;
      });
    }
    
    if (spec.components?.parameters) {
      Object.entries(spec.components.parameters).forEach(([paramName, param]) => {
        const updatedParam = updateRefs(param, servicePrefix);
        merged.components.parameters[`${servicePrefix}_${paramName}`] = updatedParam;
      });
    }
    
    if (spec.components?.securitySchemes) {
      Object.entries(spec.components.securitySchemes).forEach(([schemeName, scheme]) => {
        merged.components.securitySchemes[`${servicePrefix}_${schemeName}`] = scheme;
      });
    }
    
    console.log(`✓ Merged ${name} (${Object.keys(spec.paths || {}).length} paths)`);
  } catch (error) {
    console.error(`✗ Error processing ${name}:`, error.message);
  }
});

// Write combined file
const outputPath = './docs/combined-openapi.json';
fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2));
console.log(`\n✓ Combined OpenAPI written to ${outputPath}`);
console.log(`  Total paths: ${Object.keys(merged.paths).length}`);
console.log(`  Total schemas: ${Object.keys(merged.components.schemas).length}`);
console.log(`  Services: ${merged.tags.length}`);
