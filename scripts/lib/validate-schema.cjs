#!/usr/bin/env node
'use strict';

/**
 * validate-schema.cjs — validador minimo de JSON Schema, SEM dependencias.
 *
 * Suporta EXATAMENTE o subconjunto de JSON Schema usado pelos schemas/*.json
 * deste projeto. NAO ha $ref (os schemas validados aqui nao usam).
 *
 * Keywords suportadas:
 *   type (object|array|string|integer|number|boolean), required, properties,
 *   additionalProperties:false, items, minItems, maxItems, minLength, maxLength,
 *   minimum, maximum, minProperties, pattern (regex via new RegExp), enum.
 *
 * `pattern` segue a semantica de JSON Schema: casa em QUALQUER posicao da string
 * (nao ancorado). Ex.: "pattern": "9:16" exige que a string contenha "9:16".
 *
 * Assinatura:
 *   module.exports = function validate(schema, data) -> { valid, errors }
 *   onde errors e um array de strings com caminho legivel, ex.:
 *     "cenas[0].prompt: minLength 80 nao satisfeito"
 */

function typeOf(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value; // object | string | number | boolean
}

const SUPPORTED_SCHEMA_KEYS = new Set([
  '$schema',
  '$id',
  'title',
  'description',
  'type',
  'required',
  'properties',
  'additionalProperties',
  'items',
  'minItems',
  'maxItems',
  'minLength',
  'maxLength',
  'minimum',
  'maximum',
  'minProperties',
  'pattern',
  'enum',
]);

function matchesType(value, type) {
  switch (type) {
    case 'object':
      return value !== null && typeof value === 'object' && !Array.isArray(value);
    case 'array':
      return Array.isArray(value);
    case 'string':
      return typeof value === 'string';
    case 'integer':
      return typeof value === 'number' && Number.isInteger(value);
    case 'number':
      return typeof value === 'number';
    case 'boolean':
      return typeof value === 'boolean';
    case 'null':
      return value === null;
    default:
      return false;
  }
}

function checkType(value, schemaType, p, errors) {
  const types = Array.isArray(schemaType) ? schemaType : [schemaType];
  if (!types.some((t) => matchesType(value, t))) {
    errors.push(`${p || '(root)'}: type esperado ${types.join('|')}, recebido ${typeOf(value)}`);
    return false;
  }
  return true;
}

function validateNode(schema, data, p, errors) {
  if (!schema || typeof schema !== 'object') return;

  for (const key of Object.keys(schema)) {
    if (!SUPPORTED_SCHEMA_KEYS.has(key)) {
      errors.push(`${p || '(schema)'}: keyword de schema nao suportada (${key})`);
    }
  }

  // enum
  if (Array.isArray(schema.enum)) {
    const ok = schema.enum.some((e) => JSON.stringify(e) === JSON.stringify(data));
    if (!ok) {
      errors.push(`${p || '(root)'}: enum nao satisfeito (esperado um de ${JSON.stringify(schema.enum)})`);
    }
  }

  // type (e dispatch por tipo). Se o type nao bate, nao adianta checar regras do tipo.
  let typeOk = true;
  if (schema.type !== undefined) {
    typeOk = checkType(data, schema.type, p, errors);
  }
  if (!typeOk) return;

  const t = typeOf(data);

  // ----- string -----
  if (t === 'string') {
    if (typeof schema.minLength === 'number' && data.length < schema.minLength) {
      errors.push(`${p || '(root)'}: minLength ${schema.minLength} nao satisfeito (tem ${data.length})`);
    }
    if (typeof schema.maxLength === 'number' && data.length > schema.maxLength) {
      errors.push(`${p || '(root)'}: maxLength ${schema.maxLength} excedido (tem ${data.length})`);
    }
    if (typeof schema.pattern === 'string') {
      let re;
      try {
        re = new RegExp(schema.pattern);
      } catch (e) {
        errors.push(`${p || '(root)'}: pattern invalido no schema (${schema.pattern}): ${e.message}`);
        re = null;
      }
      if (re && !re.test(data)) {
        errors.push(`${p || '(root)'}: pattern ${schema.pattern} nao satisfeito`);
      }
    }
  }

  // ----- number / integer -----
  if (t === 'number') {
    if (typeof schema.minimum === 'number' && data < schema.minimum) {
      errors.push(`${p || '(root)'}: minimum ${schema.minimum} nao satisfeito (tem ${data})`);
    }
    if (typeof schema.maximum === 'number' && data > schema.maximum) {
      errors.push(`${p || '(root)'}: maximum ${schema.maximum} excedido (tem ${data})`);
    }
  }

  // ----- array -----
  if (t === 'array') {
    if (typeof schema.minItems === 'number' && data.length < schema.minItems) {
      errors.push(`${p || '(root)'}: minItems ${schema.minItems} nao satisfeito (tem ${data.length})`);
    }
    if (typeof schema.maxItems === 'number' && data.length > schema.maxItems) {
      errors.push(`${p || '(root)'}: maxItems ${schema.maxItems} excedido (tem ${data.length})`);
    }
    if (schema.items) {
      for (let i = 0; i < data.length; i++) {
        validateNode(schema.items, data[i], `${p}[${i}]`, errors);
      }
    }
  }

  // ----- object -----
  if (t === 'object') {
    if (typeof schema.minProperties === 'number' && Object.keys(data).length < schema.minProperties) {
      errors.push(`${p || '(root)'}: minProperties ${schema.minProperties} nao satisfeito (tem ${Object.keys(data).length})`);
    }
    if (Array.isArray(schema.required)) {
      for (const key of schema.required) {
        if (!Object.prototype.hasOwnProperty.call(data, key)) {
          errors.push(`${p ? p + '.' : ''}${key}: campo obrigatorio ausente`);
        }
      }
    }
    const props = schema.properties || {};
    for (const key of Object.keys(data)) {
      const childPath = `${p ? p + '.' : ''}${key}`;
      if (Object.prototype.hasOwnProperty.call(props, key)) {
        validateNode(props[key], data[key], childPath, errors);
      } else if (schema.additionalProperties === false) {
        errors.push(`${childPath}: propriedade nao permitida (additionalProperties:false)`);
      }
    }
  }
}

function validate(schema, data) {
  const errors = [];
  validateNode(schema, data, '', errors);
  return { valid: errors.length === 0, errors };
}

module.exports = validate;
