/**
 * Created by reedvilanueva on 11/3/16.
 */
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import BaseCollection from '/imports/api/base/BaseCollection';
import PriorityQueue from 'js-priority-queue';
import { EdgesCollection } from './EdgesCollection.js';
import {Meteor} from 'meteor/meteor';

// load utility functions, see http://stackoverflow.com/a/9901097
const utils = require('./graphUtilities');

// to import normal js libraries, see https://guide.meteor.com/structure.html#importing-from-packages

/** @module SkillGraph */

/**
 * @extends BaseCollection
 */

/**
 * A bidirectional, weighted graph where vertices are lowercase,
 * whitespace-removed strings denoting skills.
 */
//FIXME: all the methods here need to be updated for the new flattened graph structure.
//  Some things may need to be moved to other files.
class SkillGraph extends BaseCollection {

  /**
   * Creates the Semester collection.
   */
  constructor() {
    // set the parent _collection field to be used as an 'flat' adjacency list for skill nodes
    super(
        'SkillGraph',
        new SimpleSchema({
          skill: { label: 'skill', optional: false, type: String },
          skillReadable: {label: 'skillReadable', optional: false, type: String},
          adj: { label: 'adj', optional: false, type: [String] },  // stores _ids of EdgesCollection documents
          // TODO:
          // graph does not use an adjacency list, instead, all edges are maintained
          // in a separate collection of edges. This edge collection is used to answer
          // queries about edge properties of vertices.
        }),
        undefined
    );

    this._vertexCount = 0;
  }

  edgeCount() {
    return this._edgeCount;
  }

  vertexCount() {
    return this._vertexCount;
  }

  /**
   *
   * @param skill
   * adds the given lowercase, whitespace-removed skill to the graph if none with that label currently exists
   */
  addVertex(skill) {
    check(skill, String);
    const exists = this._collection.findOne({ skill: skill });
    if (!exists) {
      const newSkill = {
        skill: utils.makeUniform(skill),
        skillReadable: utils.makeReadable(skill),
        adj: [],
      };
      this._collection.insert(newSkill);

      this._vertexCount++;
    } else console.log(`SkillGraphCollection: addVertex(): ${skill}: already in graph\n`);
  }

  /**
   *
   * @param {[String]} skills
   * Adds all skills to the graph, connects all listed skills to each other each with a single edge.
   * All skills added as lowercase, whitespace-removed strings.
   */
  addVertexList(skills) {
    if(Array.isArray(skills)) {
      // add all vertices in skills array to graph
      _.each(skills, (skill) => {
        this.addVertex(skill);
      });

      // create and add edges to graph
      // all the skills get ONE undirected edge to the other skills mentioned in the skills array
      // (excluding themselves and avoid double-counting)
      for (let i = 0; i < skills.length - 1; i++) {
        for (let j = i + 1; j < skills.length; j++) {
          let v = this._collection.findOne({ skill: utils.makeUniform(skills[i]) });
          let w = this._collection.findOne({ skill: utils.makeUniform(skills[j]) });
          let weight = 0;
          EdgesCollection.addEdge(v._id, w._id, weight);
        }
      }
    } else console.log(`addVertexList: param skills = ${skills}\nis not an array\n`);
  }

  //TODO: change this function to, instead, poll the EdgesCollection to get a cursor over all edges where the given string's _id (in this._collection) is either in the vID or wID field of the doc.
  /**
   * @param {string} skill
   * @returns {[Edge]} the adjacency list associated with the given skill in the graph
   */
  adjList(skill) {
    //console.log(`In adjList(${skill})`);
    skill = utils.makeUniform(skill);
    const skillVertex = this._collection.findOne({ skill: skill });
    // console.log(skillVertex);
    // console.log();
    return skillVertex.adj;
  }

  /**
   *
   * @param {string} skill
   * @return {PriorityQueue} a 1-indexed priority queue of Edge objects by descending weights
   */
  adjMaxPQ(skill) {
    skill = utils.makeUniform(skill);
    const adjList = this.adjList(skill);

    // see https://github.com/adamhooper/js-priority-queue#options
    const edgeMaxCompare = function (e1, e2) {
      return e2.getWeight() - e1.getWeight();
    };
    const maxPQ = new PriorityQueue({
      comparator: edgeMaxCompare,
      initialValues: adjList,
      strategy: PriorityQueue.BinaryHeapStrategy
    });

    console.log(maxPQ)
    return maxPQ;
  }

  /**
   * @param {string} skill-vertex
   * @returns {string} string includes both vertices of edges and associated weight
   */
  adjListToString(skill) {
    let str = `skill: ${skill}\n`;
    skill = _makeUniform(skill);
    for (let edge of this.adjList(skill)) {
      str += `${edge.toString()}\n`;
    }
    return str;
  }
}

/**
 * Provides the singleton instance of this class to all other entities.
 */
// WARNING: the exported const can't have same name as 'type' param. given to constructor
// (causes 'duplicate declaration' error)
export const SkillGraphCollection = new SkillGraph();
