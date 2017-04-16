/**
 * Created by reedvilanueva on 11/3/16.
 */
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {check} from 'meteor/check'
import BaseCollection from '/imports/api/base/BaseCollection';
import PriorityQueue from 'js-priority-queue';
import {EdgesCollection} from './EdgesCollection.js';
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
          skillReadable: { label: 'skillReadable', optional: false, type: String },
          // Graph does not use an adjacency list, instead, all edges are maintained
          // in a separate collection of Edge docs. This Edge collection is used to answer
          // queries about edge properties of vertices. This extra level of indirection
          // is done to avoid using a transform function to linearly go thru and
          // transform each generic object representing edges (in an adjacency list)
          // into Edge type objects every time a vertex is called from a the
          // skillgraph collection.
          //
          // see imports/api/base/BaseCollection.js for more info about transform functions
          // and why they would be necessary (in the case of just having an Edge class,
          // rather than a collection, and storing Edge instances in an adjacency list).
        }),
        undefined
    );

    this._vertexCount = 0;
  }

  edgeCount() {
    return EdgesCollection.edgeCount();
  }

  vertexCount() {
    return this._vertexCount;
  }

  /**
   *
   * @param {Number} count
   * @return {[Doc]}
   * Array of count most recently added or updated vertex docs.
   * If count undefined, count defaults to 100.
   * This provides a form of caching where we can assume that the count most
   * recently used or created skills are most likely to be requested.
   */
  getSkills(count) {
    // FIXME: does $natural actually push recently updated docs to front (or just recently created ones)? Also, why does meteor give error 'unsupported sort key: $natural' when trying to explicitly use natural order?
    // find() defaults to natural order, see https://docs.meteor.com/api/collections.html#Mongo-Collection-find
    // see https://docs.mongodb.com/v3.0/reference/operator/meta/natural/
    // see http://stackoverflow.com/a/17319402
    count = (typeof count == "undefined") ? 100 : count;
    return this._collection.find({}, { limit: count }).fetch();
  }

  /**
   *
   * @param skill
   * removes the skill from the skillgraphscollection
   *
   */
  removeVertex(skill) {
    this._collection.remove(skill);
    console.log("removing vertex: " + skill);
  }

  /**
   *
   * @param skill
   * adds the given skill to the graph (as lowercase, whitespace-removed)
   * if none with that label currently exists
   */
  addVertex(skill) {
    check(skill, String);

    const exists = this._collection.findOne({ skill: utils.makeUniform(skill) });
    if (!exists) {
      // console.log(`skillgraph: addvertex: adding vertex "${skill}"`);
      const newSkill = {
        skill: utils.makeUniform(skill),
        skillReadable: utils.makeReadable(skill),
      };
      this._collection.insert(newSkill);

      this._vertexCount++;
    } else {
      // console.log(`SkillGraphCollection: addVertex(): ${skill}: already in graph\n`);
    }
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

      // check for group of skill to add/inc. weight edges between
      if(skills.length > 1){
        // create and add edges to graph
        // all the skills get ONE undirected edge to the other skills mentioned in the skills array
        // (excluding themselves and avoid double-counting)
        for (let i = 0; i < skills.length - 1; i++) {
          for (let j = i + 1; j < skills.length; j++) {
            let v = this._collection.findOne({ skill: utils.makeUniform(skills[i]) });
            let w = this._collection.findOne({ skill: utils.makeUniform(skills[j]) });
            let weight = 0;
            // console.log(`adding edge w/ ${v.skill}: ${v._id}`);
            // console.log(`adding edge w/ ${w.skill}: ${w._id}`);
            EdgesCollection.addEdge(v, w, weight);
          }
        }
      }

    } else {
      // console.log(`addVertexList: param skills = ${skills}\nis not an array\n`);
    }
  }

  /**
   * @param {string} skill
   * @returns {[doc]} an array of Edge collection docs
   * The adjacency list associated with the given skill in the graph.
   * Returns an array of Edge docs where vertices are the _ids of the skill docs
   * that the edges connect.
   */
  adjList(skill) {
    //console.log(`In adjList(${skill})`);
    skill = utils.makeUniform(skill);
    const skillDoc = this._collection.findOne({ skill: skill });

    if(!skillDoc) {
      // console.log(`The vertex "${skill}" could not be found in skillgraph`);
      return skillDoc;
    }

    // console.log("SkillGraphCollection: adjList: skillDoc");
    // console.log(skillDoc);
    const adjList = EdgesCollection.adjList(skillDoc._id);
    // console.log(skillVertex);
    // console.log();
    return adjList;
  }

  /**
   *
   * @param {string} skill
   * @return {PriorityQueue} a priority queue of Edge collection docs by descending weights
   */
  adjMaxPQ(skill) {
    skill = utils.makeUniform(skill);
    const adjList = this.adjList(skill);

    // see https://github.com/adamhooper/js-priority-queue#options
    const edgeMaxCompare = function (e1, e2) {
      return e2.weight - e1.weight;
    };
    const maxPQ = new PriorityQueue({
      comparator: edgeMaxCompare,
      initialValues: adjList,
      strategy: PriorityQueue.BinaryHeapStrategy
    });

    // console.log(maxPQ);
    return maxPQ;
  }

  /**
   * @param {string} skill-vertex
   * @returns {string} string includes both vertices of edges and associated weight
   */
  adjListToString(skill) {
    let str = `skill: ${skill}\n`;
    skill = utils.makeUniform(skill);
    for (let edgeDoc of this.adjList(skill)) {
      str += EdgesCollection.docString(edgeDoc);
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
